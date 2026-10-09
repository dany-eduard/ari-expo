import { api } from "@/services/api";
import { ReportCongregationHome, RegularPioneersActivityResponse } from "@/types/report.types";
import { Directory, File, Paths } from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { Platform } from "react-native";

export interface ZipProgress {
  jobId: string;
  total: number;
  completed: number;
  percent: number;
  currentFile: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export interface DownloadParams {
  congregation_id: number | string;
  service_year: number;
  onProgress?: (progress: ZipProgress) => void;
}

export const reportService = {
  async getRegularPioneersActivity(serviceYear?: number): Promise<RegularPioneersActivityResponse> {
    const query = serviceYear ? `?service_year=${serviceYear}` : "";
    return api.get(`/reports/regular-pioneers-activity${query}`);
  },

  async getReportCongregationHome(params: {
    congregation_id: number | string;
    year: number;
    month: number;
  }): Promise<ReportCongregationHome> {
    const queryParams = new URLSearchParams();
    queryParams.append("year", params.year.toString());
    queryParams.append("month", params.month.toString());

    return api.get(
      `/reports/congregations/${params.congregation_id}/home?${queryParams.toString()}`,
    );
  },

  async startZipGeneration(params: {
    congregation_id: number | string;
    service_year: number;
  }): Promise<{
    jobId: string;
    congregation: string;
    progressUrl: string;
    downloadUrl: string;
  }> {
    return api.post(
      `/reports/zip/generate/${params.congregation_id}/service-year/${params.service_year}`,
    );
  },

  async getZipProgress(jobId: string): Promise<ZipProgress> {
    return api.get(`/reports/zip/progress/${jobId}`);
  },

  async getZipBuffer(jobId: string): Promise<Response> {
    return api.getRaw(`/reports/zip/download/${jobId}`);
  },

  async downloadCongregationPublishersServiceYearZip(params: DownloadParams) {
    const fileName = `registro_publicadores_${params.service_year}.zip`;
    let jobId: string | null = null;
    let pollingAttempts = 0;
    const maxPollingAttempts = 300;
    const pollingInterval = 2000;

    try {
      const startResponse = await reportService.startZipGeneration({
        congregation_id: params.congregation_id,
        service_year: params.service_year,
      });

      jobId = startResponse.jobId;

      if (params.onProgress) {
        params.onProgress({
          jobId,
          total: 0,
          completed: 0,
          percent: 0,
          currentFile: "Iniciando...",
          status: "pending",
        });
      }

      while (pollingAttempts < maxPollingAttempts) {
        await new Promise((resolve) => setTimeout(resolve, pollingInterval));

        const progress = await reportService.getZipProgress(jobId);

        if (params.onProgress) {
          params.onProgress(progress);
        }

        if (progress.status === "completed") {
          break;
        }

        if (progress.status === "failed") {
          throw new Error(progress.error || "Error al generar el ZIP");
        }

        pollingAttempts++;
      }

      if (!jobId) {
        throw new Error("No se pudo iniciar la generación del ZIP");
      }

      if (pollingAttempts >= maxPollingAttempts) {
        throw new Error("Timeout: La generación del ZIP tardó demasiado");
      }

      const response = await reportService.getZipBuffer(jobId);

      if (!response) {
        throw new Error("No se pudo obtener el archivo generado");
      }

      await saveOrShareResponse(response, fileName, "application/zip", "public.zip-archive");
    } catch (error: any) {
      console.error("Error downloading report:", error);
      throw error;
    }
  },

  async getPublisherServiceYearCard(params: {
    person_id: number | string;
    service_year: number;
  }): Promise<Response> {
    return api.getRaw(`/reports/publisher/${params.person_id}/service-year/${params.service_year}`);
  },

  async downloadPublisherServiceYearCard(params: {
    person_id: number | string;
    service_year: number;
    fileName?: string;
  }): Promise<void> {
    const response = await reportService.getPublisherServiceYearCard(params);

    if (!response) {
      throw new Error("No se pudo obtener la tarjeta de publicador");
    }

    await saveOrShareResponse(
      response,
      params.fileName ?? `tarjeta_${params.person_id}_${params.service_year}.pdf`,
      "application/pdf",
      "com.adobe.pdf",
    );
  },
};

async function saveOrShareResponse(
  response: Response,
  defaultFileName: string,
  mimeType: string,
  uti: string,
): Promise<void> {
  const headerFileName =
    (response as any).headers.get("x-filename") ||
    extractFileName((response as any).headers.get("content-disposition"));
  const fileName = headerFileName || defaultFileName;

  if (Platform.OS === "web") {
    const blob = await (response as any).blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return;
  }

  const downloadsDir = new Directory(Paths.cache, "downloads");
  if (!downloadsDir.exists) {
    downloadsDir.create({ intermediates: true, idempotent: true });
  }

  const localFile = new File(downloadsDir, fileName);
  const buffer = await (response as any).arrayBuffer();
  localFile.write(new Uint8Array(buffer));

  if (!localFile.exists) {
    throw new Error("No se pudo guardar el archivo.");
  }

  await shareAsync(localFile.uri, { mimeType, dialogTitle: fileName, UTI: uti });
}

const extractFileName = (disposition: string | null) => {
  if (!disposition) return null;
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const matches = filenameRegex.exec(disposition);
  if (matches != null && matches[1]) {
    return matches[1].replace(/['"]/g, "");
  }
  return null;
};
