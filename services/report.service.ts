import { ShowAlert } from "@/components/alert";
import { api } from "@/services/api";
import { ReportCongregationHome } from "@/types/report.types";
import { Directory, File, Paths } from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { Platform } from "react-native";

export const reportService = {
  async getReportCongregationHome(params: {
    congregation_id: number | string;
    year: number;
    month: number;
  }): Promise<ReportCongregationHome> {
    const queryParams = new URLSearchParams();
    queryParams.append("year", params.year.toString());
    queryParams.append("month", params.month.toString());

    return api.get(`/reports/congregations/${params.congregation_id}/home?${queryParams.toString()}`);
  },

  async getCongregationPublishersServiceYearZip(params: { congregation_id: number | string; service_year: number }) {
    return api.getRaw(`/reports/congregations/${params.congregation_id}/publishers-service-year/${params.service_year}`);
  },

  async downloadCongregationPublishersServiceYearZip(params: { congregation_id: number | string; service_year: number }) {
    let fileName = `registro_publicadores_${params.service_year}.zip`;

    const response = await reportService.getCongregationPublishersServiceYearZip({
      congregation_id: params.congregation_id,
      service_year: params.service_year,
    });

    // Obtener nombre del archivo desde las cabeceras
    const xFileName = (response as any).headers.get("x-filename");
    const cdFileName = extractFileName((response as any).headers.get("content-disposition"));
    if (xFileName) fileName = xFileName;
    else if (cdFileName) fileName = cdFileName;

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
    } else {
      const downloadsDir = new Directory(Paths.cache, "downloads");
      if (!downloadsDir.exists) {
        downloadsDir.create({ intermediates: true, idempotent: true });
      }

      const localFile = new File(downloadsDir, fileName);
      const buffer = await (response as any).arrayBuffer();
      localFile.write(new Uint8Array(buffer));

      if (localFile.exists) {
        await shareAsync(localFile.uri, {
          mimeType: "application/zip",
          dialogTitle: fileName,
          UTI: "public.zip-archive",
        });
      } else {
        ShowAlert("Error", "No se pudo guardar el archivo.");
      }
    }
  },
};

const extractFileName = (disposition: string | null) => {
  if (!disposition) return null;
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const matches = filenameRegex.exec(disposition);
  if (matches != null && matches[1]) {
    return matches[1].replace(/['"]/g, "");
  }
  return null;
};
