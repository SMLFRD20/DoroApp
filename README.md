# DoroApp

DoroApp es una aplicación móvil de productividad desarrollada en Flutter que ayuda a estudiantes y profesionales a organizar su tiempo, mantener el enfoque y gestionar sus tareas diarias mediante la técnica Pomodoro.

## Características Principales

- Temporizador Pomodoro con intervalos de enfoque, descanso corto y descanso largo.
- Gestión completa de tareas pendientes (crear, editar, completar y vincular con ciclos de trabajo).
- Panel de inicio dinámico con resumen de progreso diario y frases motivacionales.
- Módulo de estadísticas detalladas con gráficas de productividad semanal.
- Gestión de perfil de usuario con edición de datos y carga de avatar.

## Tecnologías Utilizadas

- Frontend: Flutter y Dart.
- Navegación: GoRouter con transiciones animadas.
- Gestión de Estado: Provider.
- Gráficas: fl_chart.
- Backend y Base de Datos: Supabase (PostgreSQL).
- Autenticación: Supabase Auth.
- Almacenamiento: Supabase Storage para fotos de perfil.

## Estructura del Proyecto

- `lib/main.dart`: Punto de entrada de la aplicación y configuración de temas y rutas.
- `lib/screens/`: Pantallas principales de la aplicación (Login, Registro, Dashboard, Temporizador, Tareas, Estadísticas y Perfil).
- `lib/services/`: Proveedores de autenticación y lógica de conexión con Supabase.
- `lib/widgets/`: Componentes de interfaz reutilizables.

## Requisitos de Instalación

1. Clonar el repositorio.
2. Asegurarse de tener instalado Flutter SDK (versión igual o superior a 3.12.2).
3. Ejecutar `flutter pub get` para instalar las dependencias.
4. Configurar las credenciales de Supabase en un archivo `.env` en la raíz del proyecto.
5. Compilar e instalar la aplicación ejecutando `flutter run` o generar el instalador con `flutter build apk --release`.
