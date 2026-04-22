# Guía de Instalación Local - Proyecto Clinicks

Esta guía contiene las instrucciones paso a paso para configurar el entorno de desarrollo local del proyecto **Clinicks** desde cero. Está pensada para cualquier integrante del grupo `ISII_26TC_Grupo43` o cuerpo docente que necesite evaluar la aplicación.

---

## 1. Requisitos de Software

Para correr el proyecto exitosamente y evitar problemas de dependencias, es obligatorio contar con las siguientes herramientas:

*   **Java 17 (LTS):** Es **estrictamente necesario**.
    > [!CAUTION]
    > **No utilizar Java 21, Java 25 ni otras versiones superiores.** Estas versiones rompen la compatibilidad con el plugin de Spring Boot 3.2.5 utilizado en la arquitectura actual.
*   **Node.js v18+ y npm:** Requeridos para gestionar e iniciar el proyecto frontend.
*   **Maven 3.9+:** Gestor principal para compilar el backend.

---

## 2. Configuración del Backend (`/backend`)

Toda la lógica de negocio y exposición de la API reside en el directorio `/backend`.

### Variables de Entorno
Debes crear un archivo llamado `.env` en la raíz de la carpeta `/backend` e incluir los datos reales de conexión a tu base de datos:

```env
DB_URL=jdbc:postgresql://<tu-instancia-supabase-o-local>:5432/postgres
DB_USER=postgres
DB_PASS=tu_contraseña_segura
```

### Archivo de Propiedades
En el directorio de configuración del proyecto, vas a encontrar un archivo de muestra llamado `application-example.yml`.
1. Haz una copia de ese archivo y nómbrala **`application.yml`**.
2. Verifica que las propiedades hagan referencia correcta a las variables ubicadas en tu archivo `.env` o bien reemplázalas de forma manual si prefieres trabajar sin el env temporalmente.

### Instalación y Ejecución
Abre una terminal apuntando al directorio `/backend` y ejecuta los siguientes comandos:

```bash
# Para limpiar empaquetados previos y compilar el proyecto
mvn clean

# Para iniciar el servidor de Spring Boot
mvn spring-boot:run
```

Si todo es correcto, la API REST estará escuchando en **`http://localhost:8080`**.

---

## 3. Configuración del Frontend (`/frontend`)

El cliente web está construido con un stack moderno apoyado por Vite. 

### Variables de Entorno
Al igual que en el backend, es una buena práctica crear un archivo `.env` en la raíz de la carpeta `/frontend` para configuraciones propias, aunque el proxy de desarrollo delegará la mayor parte de las conexiones de red:

```env
VITE_API_URL=http://localhost:8080
```

### Instalación de Dependencias
Abre una terminal apuntando al directorio `/frontend` y descarga los módulos necesarios de npm:

```bash
npm install
```

### Ejecución
Para iniciar el entorno de desarrollo en caliente ('hot-reload') ejecuta:

```bash
npm run dev
```

El servidor del frontend correrá en **`http://localhost:5173`**.

---

## 4. Notas Importantes

> [!TIP]
> **Orden de inicio del sistema:**
> Siempre recomendamos iniciar el **backend primero**. Una vez que la consola confirme que Spring Boot ha arrancado satisfactoriamente, procede a ejecutar el frontend. De esta forma, al abrir el navegador inicial para cargar las vistas, la base de datos y la API ya estarán disponibles para proveer la información requerida.

> [!NOTE]
> **Proxy de Vite:**
> Como herramienta de desarrollo, Vite está configurado para actuar como un proxy. Esto significa que cualquier solicitud realizada desde el cliente hacia rutas que comiencen con `/api` será redirigida automáticamente y de manera transparente por detrás de escena hacia al backend en el puerto `8080`. Esto simplifica la comunicación para desarrollo local.
