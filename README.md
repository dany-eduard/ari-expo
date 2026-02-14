# ARI - Sistema de Gestión de Congregación

<p align="center">
  <img src="./assets/images/icon.png" alt="ARI Logo" width="120" />
</p>

<p align="center">
  <strong>ARI</strong> es una aplicación móvil y web desarrollada con <strong>Expo</strong> y <strong>React Native</strong>, diseñada para la gestión integral de congregaciones de Testigos de Jehová.
</p>

<p align="center">
  Permite administrar personas, equipos de predicación, registrar informes mensuales de servicio y generar reportes consolidado de la congregación.
</p>

---

<div align="center">

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&labelColor=FFF)
![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&labelColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&labelColor=FFF)
![NativeWind](https://img.shields.io/badge/NativeWind-2D3748?style=for-the-badge&logo=windcss&labelColor=38B2AC)
![License](https://img.shields.io/badge/License-GPL%203.0-red?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.2.1-blue?style=for-the-badge)

</div>

---

## Tabla de Contenidos

1. [Características Principales](#características-principales)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación y Setup](#instalación-y-setup)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Scripts Disponibles](#scripts-disponibles)
6. [Variables de Entorno](#variables-de-entorno)
7. [Guía de Contribución](#guía-de-contribución)
8. [Licencia](#licencia)

---

## Características Principales

| Característica                 | Descripción                                                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 📊 **Dashboard**               | Vista general con estadísticas de la congregación, progreso de informes y actividad reciente                            |
| 👥 **Gestión de Personas**     | Registro y edición de publicadores con información completa (nombre, fecha de nacimiento, privilegio de servicio, etc.) |
| 👨‍👩‍👧‍👦 **Gestión de Equipos**      | Administración de grupos de predicación con asignación de integrantes                                                   |
| 📝 **Informes de Predicación** | Registro mensual de horas, revistas, возвраты y cursos bíblicos por publicador                                          |
| 📥 **Exportación**             | Generación y descarga de reportes consolidados en formato ZIP                                                           |
| 🌙 **Modo Oscuro**             | Soporte completo para tema oscuro/claro                                                                                 |
| 🔐 **Autenticación**           | Sistema de autenticación seguro con JWT                                                                                 |

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Requisito          | Versión Mínima | Descripción                                   |
| ------------------ | -------------- | --------------------------------------------- |
| **Node.js**        | v20.x (LTS)    | Entorno de ejecución de JavaScript            |
| **npm**            | v10.x          | Gestor de paquetes                            |
| **Expo CLI**       | Latest         | CLI de Expo (se instala con las dependencias) |
| **Android Studio** | -              | Para emulador Android (opcional)              |
| **Xcode**          | -              | Para simulador iOS (solo macOS)               |

> **Nota:** Para desarrollo en dispositivos físicos, necesitas la app **Expo Go** (iOS/Android) o **EAS Build** para builds de producción.

---

## Instalación y Setup

### 1. Clonar el repositorio

```bash
git clone git@github.com:dany-eduard/ari-expo.git
cd ari-expo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configúralo:

```bash
cp .example.env .env
```

Edita el archivo `.env` y configura la URL de tu API:

```env
EXPO_PUBLIC_API_URL=https://tu-api-production.com
```

> **⚠️ Importante:** No commitees el archivo `.env` con credenciales reales. Ya está ignorado en `.gitignore`.

### 4. Iniciar la aplicación

#### Modo Desarrollo (Web)

```bash
npm run web
```

#### Modo Desarrollo (Android)

```bash
npm run android
```

#### Modo Desarrollo (iOS - macOS)

```bash
npm run ios
```

#### Iniciar con Expo Go

```bash
npm start
```

Luego escanea el código QR con la app Expo Go en tu dispositivo.

---

## Estructura del Proyecto

```
ari-expo/
├── app/                          # Directorio principal (Expo Router - File-based routing)
│   ├── (tabs)/                  # Rutas con tabs de navegación
│   │   ├── _layout.tsx          # Layout del tab navigator
│   │   ├── index.tsx            # Dashboard / Página principal
│   │   ├── people.tsx           # Gestión de personas
│   │   ├── teams.tsx           # Gestión de equipos
│   │   └── settings.tsx        # Configuración de la app
│   ├── auth/                   # Rutas de autenticación
│   │   ├── sign-in.tsx         # Inicio de sesión
│   │   └── sign-up.tsx         # Registro
│   ├── people/                 # Gestión de personas
│   │   ├── new.tsx             # Crear nueva persona
│   │   └── [id].tsx            # Detalle/editar persona
│   ├── teams/                  # Gestión de equipos
│   │   ├── new.tsx             # Crear nuevo equipo
│   │   └── edit/[id].tsx       # Editar equipo
│   └── _layout.tsx             # Layout raíz de la app
├── assets/                      # Recursos estáticos
│   └── images/                 # Imágenes, iconos, splash
├── components/                  # Componentes reutilizables
│   ├── ui/                     # Componentes de UI (inputs, selects, etc.)
│   ├── people/                 # Componentes específicos de personas
│   ├── teams/                  # Componentes específicos de equipos
│   ├── providers/              # Proveedores de contexto
│   ├── alert.tsx               # Componente de alertas
│   ├── ctx.tsx                 # Contexto de sesión/auth
│   └── themed-*.tsx            # Componentes con soporte de tema
├── constants/                   # Constantes de la aplicación
│   ├── config.ts               # Configuración general
│   ├── person.ts               # Constantes de persona
│   └── theme.ts                # Definiciones de tema
├── hooks/                       # Custom hooks
│   ├── use-color-scheme.ts     # Detección de esquema de color
│   ├── useHasPermission.ts     # Control de permisos
│   ├── useStorageState.ts      # Estado persistente
│   └── useUpdateAlert.ts       # Alertas de actualización
├── services/                    # Servicios de API
│   ├── api.ts                  # Configuración de Axios/cliente HTTP
│   ├── auth.service.ts         # Autenticación
│   ├── person.service.ts      # CRUD de personas
│   ├── team.service.ts        # CRUD de equipos
│   ├── report.service.ts      # Informes y reportes
│   └── log-actions.service.ts # Registro de acciones
├── types/                       # Definiciones de TypeScript
│   ├── auth.types.ts           # Tipos de autenticación
│   ├── person.types.ts         # Tipos de persona
│   ├── team.types.ts           # Tipos de equipo
│   └── report.types.ts         # Tipos de informes
├── utils/                       # Utilidades
│   └── date.utils.ts           # Funciones de fecha
├── app.json                     # Configuración de Expo
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración de TypeScript
├── tailwind.config.js          # Configuración de Tailwind
└── .env.example                 # Ejemplo de variables de entorno
```

---

## Scripts Disponibles

| Script                             | Descripción                                   |
| ---------------------------------- | --------------------------------------------- |
| `npm start`                        | Inicia el servidor de desarrollo de Expo      |
| `npm run web`                      | Inicia la app en modo web                     |
| `npm run android`                  | Inicia la app en emulador Android             |
| `npm run ios`                      | Inicia la app en simulador iOS (macOS)        |
| `npm run lint`                     | Ejecuta el linter de código                   |
| `npm run export:web`               | Exporta la app para web estática              |
| `npm run build:android:preview`    | Build de Android con perfil preview (EAS)     |
| `npm run build:android:production` | Build de Android para producción (EAS)        |
| `npm run update:preview`           | Publica actualización en branch preview (EAS) |
| `npm run update:production`        | Publica actualización en producción (EAS)     |
| `npm run version:patch`            | Incrementa versión patch (x.x.**1**)          |
| `npm run version:minor`            | Incrementa versión minor (x.**1**.0)          |
| `npm run version:major`            | Incrementa versión major (**1**.0.0)          |

---

## Variables de Entorno

| Variable              | Descripción             | Ejemplo                   |
| --------------------- | ----------------------- | ------------------------- |
| `EXPO_PUBLIC_API_URL` | URL base de la API REST | `https://api.example.com` |

### Configuración para desarrollo local

```env
# Desarrollo local
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

---

## Guía de Contribución

¡Gracias por tu interés en contribuir a ARI! Sigue estos pasos:

### 1. Fork y Clone

```bash
git clone <tu-fork-url>
cd ari-expo
```

### 2. Crear una rama

```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/descripcion-del-fix
```

### 3. Realizar cambios

- Sigue las convenciones de código existentes
- Usa **TypeScript** para todo el código nuevo
- Mantén los componentes pequeños y reutilizables
- Evita agregar comentarios innecesarios

### 4. Commitear cambios

```bash
git add .
git commit -m "feat: descripción breve del cambio"
```

> Usa conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 5. Ejecutar linter

```bash
npm run lint
```

### 6. Push y Pull Request

```bash
git push origin feature/nueva-funcionalidad
```

Luego, crea un Pull Request desde GitHub/GitLab.

### Estándares de código

- **TypeScript strict mode** habilitado
- **ESLint** con configuración de Expo
- **Prettier** con plugin de Tailwind CSS
- Componentes funcionales con Hooks
- Named exports para mejor tree-shaking

---

## Licencia

GNU General Public License v3.0 (GPL-3.0) - Copyright (c) 2024

Este programa es software libre: puedes redistribuirlo y/o modificarlo
bajo los términos de la Licencia Pública General GNU publicada por
la Free Software Foundation, ya sea la versión 3 de la Licencia, o
(a tu opción) cualquier versión posterior.

Este programa se distribuye con la esperanza de que sea útil,
pero SIN NINGUNA GARANTÍA; sin siquiera la garantía implícita de
COMERCIABILIDAD o APTITUD PARA UN PROPÓSITO PARTICULAR. Consulta la
Licencia Pública General GNU para más detalles.

Deberías haber recibido una copia de la Licencia Pública General GNU
junto con este programa. Si no la has recibido, consulta <https://www.gnu.org/licenses/>.

---

<div align="center">

Hecho con ❤️ usando [Expo](https://expo.dev)

</div>
