export interface paths {
    "/files/upload/{bucket}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Subir un fichero a la sección del usuario con sesión iniciada */
        post: operations["FileUserController_uploadFile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/delete/{bucket}/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Eliminar un fichero del bucket indicado del usuario con sesión iniciada */
        delete: operations["FileUserController_deleteFile"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/download/{bucket}/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Descargar un fichero (por ID) de un bucket del usuario con sesión iniciada */
        get: operations["FileUserController_downloadFile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/file-url/{bucket}/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Genera una URL única para descargar un archivo del bucket de un usuario */
        get: operations["FileUserController_generateUrlFile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/get-all/{bucket}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista con todos los ficheros de un bucket del usuario con sesión iniciada */
        get: operations["FileUserController_getAll"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/enums/buckets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve todos los posibles buckets del gestor de ficheros. */
        get: operations["FileUserController_getBucketsValues"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/logs/retrieve-dir-logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista ficheros y carpetas de una ruta de logs */
        get: operations["FileExplorerLogsController_retrieveDirLogs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/logs/retrieve-log": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve un archivo de log */
        get: operations["FileExplorerLogsController_retrieveLog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Iniciar sesión en la plataforma. Devuelve "accessToken" si el inicio es correcto */
        post: operations["AuthController_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Registro de usuario nuevo en la plataforma */
        post: operations["AuthController_register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/verify-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verifica el email de un usuario mediante código de 6 dígitos enviado por correo */
        post: operations["AuthController_verifyEmail"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Refresca el token de sesión para el usuario activo */
        post: operations["AuthController_refreshToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Actualiza parcialmente la sesión/perfil del usuario (idioma, nombre, email, contraseña, etc.) y devuelve un nuevo token */
        patch: operations["AuthController_updateSession"];
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Verificar el estado del servicio */
        get: operations["HealthController_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/locality": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Busca localidades por prefijo de nombre (autocompletado) */
        get: operations["LocalityController_search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar viajes del usuario autenticado */
        get: operations["TripController_findAllTrips"];
        put?: never;
        /** Crear un nuevo viaje */
        post: operations["TripController_createTrip"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/invitation/mine": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener mis invitaciones pendientes */
        get: operations["TripController_findMyInvitations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/invitation/{invitationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Responder a una invitación (aceptar/rechazar) */
        put: operations["TripController_respondInvitation"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener detalle de un viaje */
        get: operations["TripController_findOneTrip"];
        /** Actualizar un viaje */
        put: operations["TripController_updateTrip"];
        post?: never;
        /** Eliminar un viaje (soft-delete) */
        delete: operations["TripController_removeTrip"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/member": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar miembros de un viaje */
        get: operations["TripController_findAllMembers"];
        put?: never;
        /** Añadir un miembro al viaje */
        post: operations["TripController_addMember"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/member/{memberId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Actualizar un miembro del viaje */
        put: operations["TripController_updateMember"];
        post?: never;
        /** Eliminar un miembro del viaje */
        delete: operations["TripController_removeMember"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/invitation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar invitaciones del viaje */
        get: operations["TripController_findAllInvitations"];
        put?: never;
        /** Enviar invitación para unirse al viaje */
        post: operations["TripController_createInvitation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/itinerary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar paradas del itinerario */
        get: operations["TripController_findAllItineraryStops"];
        put?: never;
        /** Añadir parada al itinerario */
        post: operations["TripController_addItineraryStop"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/itinerary/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Reordenar paradas del itinerario */
        put: operations["TripController_reorderItinerary"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/itinerary/{stopId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Actualizar una parada del itinerario */
        put: operations["TripController_updateItineraryStop"];
        post?: never;
        /** Eliminar una parada del itinerario */
        delete: operations["TripController_removeItineraryStop"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/ticket": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar tickets del viaje */
        get: operations["TripController_findAllTickets"];
        put?: never;
        /** Crear un ticket para el viaje */
        post: operations["TripController_createTicket"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/ticket/{ticketId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Actualizar un ticket del viaje */
        put: operations["TripController_updateTicket"];
        post?: never;
        /** Eliminar un ticket del viaje */
        delete: operations["TripController_removeTicket"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/expense": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar gastos del viaje */
        get: operations["TripController_findAllExpenses"];
        put?: never;
        /** Crear un gasto en el viaje */
        post: operations["TripController_createExpense"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/trip/{id}/expense/{expenseId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Actualizar un gasto del viaje */
        put: operations["TripController_updateExpense"];
        post?: never;
        /** Eliminar un gasto del viaje */
        delete: operations["TripController_removeExpense"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Buscar usuarios por nombre o email. */
        get: operations["UserController_searchUsers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/all-users-pagination": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve todos los usuarios paginados */
        get: operations["UserController_getPaginatedUsers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/profile-info": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtiene la información del perfil del usuario que tiene la sesión iniciada */
        get: operations["UserController_profile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/upload-profile-pic": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sube la foto de perfil del usuario. Si ya existe foto, la modifica */
        post: operations["UserController_uploadProfilePic"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/download-profile-pic": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Descargar el avatar del usuario */
        get: operations["UserController_downloadProfilePic"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/update-2FA/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Cambia el valor de 2FA de otro usuario */
        put: operations["UserController_updateTwoFA"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/update-user-admin/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Actualiza cualquier usuario por su ID */
        put: operations["UserController_updateAnyUser"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/update-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Actualiza la contraseña del usuario */
        put: operations["UserController_updatePassword"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/update-status/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Actualiza el estado de un usuario en la plataforma */
        put: operations["UserController_updateUserStatus"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/admin-reset-password/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Reinicia la contraseña de un usuario por parte de un administrador */
        put: operations["UserController_adminResetPassword"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/delete-profile-pic": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Elimina la foto de perfil del usuario autenticado */
        delete: operations["UserController_deleteProfilePic"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/delete-user": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Borra un usuario de la base de datos */
        delete: operations["UserController_deleteUser"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/desactivate-user": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Desactiva la cuenta del usuario que lanza el end-point. CUIDADO: No pide confirmación */
        delete: operations["UserController_desactivateUser"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/i18n-validator/missing-translations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["I18nValidatorController_getMissingTranslations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/i18n-validator/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["I18nValidatorController_getI18nStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/i18n-validator/completely-missing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["I18nValidatorController_getCompletelyMissingTranslations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        UploadFileOutputDto: {
            /** @example archivo_ejemplo.txt */
            file_name: string;
            /**
             * @description File ID (MinIO etag)
             * @example 5f9b3b3b4b3b4b3b4b3b4b3b
             */
            id: string;
            /** @example true */
            status: boolean;
        };
        DeleteFileOutputDto: {
            /**
             * @description ID del archivo eliminado
             * @example 1
             */
            id: string;
            /**
             * @description Indica si la eliminación fue exitosa
             * @example true
             */
            status: boolean;
        };
        StreamableFile: Record<string, never>;
        FileUrlOut: {
            /** @example http://localhost:9000/examplebucket1/1-plantilladebacktestingcompany/cap-ejemplo.png */
            url: string;
        };
        FileOutputDto: {
            /**
             * @description File name (null for directories)
             * @example archivo_ejemplo1.txt
             */
            file_name: string | null;
            /**
             * @description File ID (MinIO etag)
             * @example 5f9b3b3b4b3b4b3b4b3b4b3b
             */
            id: string;
            /**
             * @description Whether this is a directory
             * @example false
             */
            isDirectory: boolean;
            /**
             * @description Full path in bucket
             * @example user123/documents/
             */
            path: string;
            /**
             * @description File size in bytes
             * @example 8192
             */
            size: number;
            /**
             * Format: date-time
             * @description Upload date (null for directories)
             * @example 2024-07-04T00:00:00.000Z
             */
            upload_date: string | null;
        };
        BucketInfoDto: {
            /**
             * @description ID numérico del bucket
             * @example 1
             */
            id: number;
            /**
             * @description Nombre del bucket
             * @example public
             */
            name: string;
        };
        LoginDto: {
            /**
             * @description El correo electrónico del usuario para iniciar sesión
             * @example usuario@ejemplo.com
             */
            email: string;
            /** @example example@mail.com */
            password: string;
        };
        BackendTokensDTO: {
            /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNvcnJlb0Bob3N0aW5nLmNvbSIsInJvbGUiOiJmcmVlIiwiaWF0IjoxNzI4MDc3NzEzLCJleHAiOjE3MjgwNzc4MzN9.Dh2Erof1boThJcO3fh_Prh4AJf4TftYWoYsw_Dm65Yo */
            accessToken: string;
            /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNvcnJlb0Bob3N0aW5nLmNvbSIsInJvbGUiOiJmcmVlIiwiaWF0IjoxNzI4MDc3NzEzLCJleHAiOjE4MTQ0Nzc3MTN9.Xn4SIDaxiuzustHoVoQu3qWaA3q1W4Gh8JJFiZhtEjk */
            refreshToken: string;
        };
        /** @enum {string} */
        Language: "en" | "es" | "gl";
        /** @enum {string} */
        Role: "USER" | "ADMIN";
        UserDTO: {
            /**
             * @description URL del avatar del usuario
             * @example /api/storage/user-550e8400-e29b-41d4-a716-446655440000/public/avatar.png
             */
            avatarURL?: string | null;
            /** @example correo@hosting.com */
            email: string;
            /**
             * @description UUID único del usuario
             * @example 550e8400-e29b-41d4-a716-446655440000
             */
            id: string;
            /** @example es */
            language: components["schemas"]["Language"];
            /** @example 2024-01-16T10:30:00.000Z */
            lastLogIn: string | null;
            /** @example USER */
            role: components["schemas"]["Role"];
            /**
             * @description Indica si el usuario tiene habilitada la autenticación 2FA.
             * @example false
             */
            twoFactorEnabled: boolean;
            /** @example Carlos */
            firstName: string;
            /** @example García López */
            lastName: string;
            /** @example true */
            validated: boolean;
        };
        LoginOutputDto: {
            backendTokens: components["schemas"]["BackendTokensDTO"];
            user: components["schemas"]["UserDTO"];
        };
        ThrotterGuardErrorDto: {
            /** @example ThrottlerException: Too Many Requests */
            message: string;
            /** @example 429 */
            statusCode: number;
        };
        NewRegisterDto: {
            /** @example correo@hosting.com */
            mail: string;
            /** @example Carlos */
            firstName: string;
            /** @example García López */
            lastName: string;
            /** @example example@mail.com */
            password: string;
            /** @example example@mail.com */
            repeatPassword: string;
        };
        NewRegisterOutput: {
            /**
             * @description Correo electrónico al que se envió el código de verificación.
             * @example correo@hosting.com
             */
            mail: string;
            /**
             * @description Resultado de la politica de admision aplicada al registro.
             * @example ADMITTED
             */
            admissionResult: string;
        };
        VerifyEmailDto: {
            /**
             * @description Correo electrónico del usuario que se está verificando.
             * @example correo@hosting.com
             */
            email: string;
            /**
             * @description Código de verificación de 6 dígitos enviado por email.
             * @example 123456
             */
            code: string;
        };
        UpdateSessionDto: {
            /**
             * @description Nombre del archivo de avatar/foto de perfil
             * @example avatar-123456789.jpg
             */
            avatarFileName?: string;
            /**
             * @description Idioma preferido del usuario
             * @example es
             */
            language?: components["schemas"]["Language"];
            /**
             * @description Correo electrónico del usuario
             * @example correo@hosting.com
             */
            mail?: string;
            /**
             * @description Nombre del usuario
             * @example Carlos
             */
            firstName?: string;
            /**
             * @description Apellidos del usuario
             * @example García López
             */
            lastName?: string;
            /**
             * @description Contraseña actual (requerida si se desea cambiar la contraseña)
             * @example PasswordActual123_
             */
            oldPassword?: string;
            /**
             * @description Nueva contraseña del usuario
             * @example NuevaPassword123_
             */
            password?: string;
            /**
             * @description Rol del usuario en el sistema
             * @example USER
             */
            role?: components["schemas"]["Role"];
            /**
             * @description Indica si habilitar o deshabilitar la autenticación 2FA
             * @example true
             */
            twoFactorEnabled?: boolean;
        };
        Locality: Record<string, never>;
        CreateTripDto: {
            /** @example Viaje a Madrid */
            name: string;
            /** @example Un viaje cultural por la capital de España */
            description?: string;
            /** @example 2026-06-01T00:00:00.000Z */
            startDate: string;
            /** @example 2026-06-10T00:00:00.000Z */
            endDate: string;
            /** @example 1500 */
            budget?: number;
            /** @example 1 */
            localityId?: number;
        };
        TripLocalityOutputDto: {
            /** @example 1 */
            id: number;
            /** @example Madrid */
            name: string;
            /** @example Madrid */
            province: string;
            /** @example Comunidad de Madrid */
            autonomousCommunity: string;
        };
        TripOutputDto: {
            /** @example a1b2c3d4-e5f6-7890-abcd-ef1234567890 */
            id: string;
            /** @example Viaje a Madrid */
            name: string;
            /** @example Un viaje cultural por la capital */
            description?: Record<string, never>;
            /**
             * Format: date-time
             * @example 2026-06-01T00:00:00.000Z
             */
            startDate: string;
            /**
             * Format: date-time
             * @example 2026-06-10T00:00:00.000Z
             */
            endDate: string;
            /** @example 8 */
            rating?: Record<string, never>;
            /** @example 1500 */
            budget?: Record<string, never>;
            /**
             * @example PLANNED
             * @enum {string}
             */
            status: "PLANNED" | "ACTIVE" | "FINISHED" | "CANCELLED";
            locality?: components["schemas"]["TripLocalityOutputDto"];
            /** @example 3 */
            memberCount: number;
            /**
             * Format: date-time
             * @example 2026-03-12T10:00:00.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @example 2026-03-12T10:00:00.000Z
             */
            updatedAt: string;
        };
        TripListOutputDto: {
            /** @example a1b2c3d4-e5f6-7890-abcd-ef1234567890 */
            id: string;
            /** @example Viaje a Madrid */
            name: string;
            /** @example Un viaje cultural por la capital */
            description?: Record<string, never>;
            /**
             * Format: date-time
             * @example 2026-06-01T00:00:00.000Z
             */
            startDate: string;
            /**
             * Format: date-time
             * @example 2026-06-10T00:00:00.000Z
             */
            endDate: string;
            /**
             * @example PLANNED
             * @enum {string}
             */
            status: "PLANNED" | "ACTIVE" | "FINISHED" | "CANCELLED";
            /** @example 3 */
            memberCount: number;
            /** @example Madrid */
            localityName?: Record<string, never>;
        };
        InvitationUserOutputDto: {
            /** @example b2c3d4e5-f6a7-8901-bcde-f12345678901 */
            id: string;
            /** @example Carlos */
            firstName: Record<string, never>;
            /** @example García López */
            lastName: Record<string, never>;
            /** @example carlos@example.com */
            email: string;
        };
        InvitationTripOutputDto: {
            /** @example a1b2c3d4-e5f6-7890-abcd-ef1234567890 */
            id: string;
            /** @example Viaje a Madrid */
            name: string;
        };
        InvitationOutputDto: {
            /** @example d4e5f6a7-b890-1234-defa-234567890123 */
            id: string;
            /**
             * @example PENDING
             * @enum {string}
             */
            status: "PENDING" | "ACCEPTED" | "REJECTED";
            issuer: components["schemas"]["InvitationUserOutputDto"];
            receiver: components["schemas"]["InvitationUserOutputDto"];
            trip: components["schemas"]["InvitationTripOutputDto"];
            /**
             * Format: date-time
             * @example 2026-03-12T10:00:00.000Z
             */
            createdAt: string;
        };
        RespondInvitationDto: {
            /** @example true */
            accept: boolean;
        };
        UpdateTripDto: {
            /** @example Viaje a Madrid */
            name?: string;
            /** @example Un viaje cultural por la capital de España */
            description?: string;
            /** @example 2026-06-01T00:00:00.000Z */
            startDate?: string;
            /** @example 2026-06-10T00:00:00.000Z */
            endDate?: string;
            /** @example 1500 */
            budget?: number;
            /** @example 1 */
            localityId?: number;
            /** @example 8 */
            rating?: number;
            /**
             * @example ACTIVE
             * @enum {string}
             */
            status?: "PLANNED" | "ACTIVE" | "FINISHED" | "CANCELLED";
        };
        MemberUserOutputDto: {
            /** @example b2c3d4e5-f6a7-8901-bcde-f12345678901 */
            id: string;
            /** @example Carlos */
            firstName?: Record<string, never>;
            /** @example García López */
            lastName?: Record<string, never>;
            /** @example carlos@example.com */
            email: string;
        };
        TripMemberOutputDto: {
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            id: string;
            user: components["schemas"]["MemberUserOutputDto"];
            /** @example true */
            canEditBudget: boolean;
            /** @example true */
            canEditTrip: boolean;
            /** @example true */
            canEditDetails: boolean;
            /** @example true */
            canModifyMembers: boolean;
            /** @example true */
            canInviteMembers: boolean;
            /** @example true */
            canManageTickets: boolean;
            /** @description Indica si el miembro es el creador del viaje. */
            isCreator: boolean;
            /** @example Conductor */
            decorativeRole?: Record<string, never>;
            /**
             * Format: date-time
             * @example 2026-03-12T10:00:00.000Z
             */
            createdAt: string;
        };
        CreateTripMemberDto: {
            /** @example a1b2c3d4-e5f6-7890-abcd-ef1234567890 */
            userId: string;
            /** @example false */
            canEditBudget?: boolean;
            /** @example false */
            canEditTrip?: boolean;
            /** @example false */
            canEditDetails?: boolean;
            /** @example false */
            canModifyMembers?: boolean;
            /** @example false */
            canInviteMembers?: boolean;
            /** @example false */
            canManageTickets?: boolean;
            /** @example Conductor */
            decorativeRole?: string;
        };
        UpdateTripMemberDto: {
            /** @example a1b2c3d4-e5f6-7890-abcd-ef1234567890 */
            userId?: string;
            /** @example false */
            canEditBudget?: boolean;
            /** @example false */
            canEditTrip?: boolean;
            /** @example false */
            canEditDetails?: boolean;
            /** @example false */
            canModifyMembers?: boolean;
            /** @example false */
            canInviteMembers?: boolean;
            /** @example false */
            canManageTickets?: boolean;
            /** @example Conductor */
            decorativeRole?: string;
        };
        InviteMemberDto: {
            /** @example b2c3d4e5-f6a7-8901-bcde-f12345678901 */
            receiverId: string;
        };
        CreateItineraryStopDto: {
            /** @example Museo del Prado */
            name: string;
            /** @example 40.4138 */
            latitude: number;
            /** @example -3.6921 */
            longitude: number;
            /** @example 1800 */
            travelTime?: number;
            /**
             * @example CAR
             * @enum {string}
             */
            travelMethod?: "CAR" | "WALKING";
            /** @example 2026-06-01T10:00:00.000Z */
            arriveAt?: string;
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            afterStopId?: string;
        };
        ItineraryOutputDto: {
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            id: string;
            /** @example Museo del Prado */
            name: string;
            /** @example 40.4138 */
            latitude: number;
            /** @example -3.6921 */
            longitude: number;
            /** @example 1800 */
            travelTime?: Record<string, never>;
            /**
             * @example CAR
             * @enum {string}
             */
            travelMethod?: "CAR" | "WALKING";
            /** @example 2026-06-01T10:00:00.000Z */
            arriveAt?: Record<string, never>;
            /** @example 1 */
            order: number;
            /** @example d4e5f6a7-b890-1234-defa-234567890123 */
            nextDestinationId?: Record<string, never>;
            /** @example a1b2c3d4-e5f6-7890-abcd-ef1234567890 */
            previousDestinationId?: Record<string, never>;
            /**
             * Format: date-time
             * @example 2026-03-12T10:00:00.000Z
             */
            createdAt: string;
        };
        ReorderItineraryDto: {
            /**
             * @example [
             *       "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
             *       "b2c3d4e5-f6a7-8901-bcde-f12345678901"
             *     ]
             */
            stopIds: string[];
        };
        UpdateItineraryStopDto: {
            /** @example Museo del Prado */
            name?: string;
            /** @example 40.4138 */
            latitude?: number;
            /** @example -3.6921 */
            longitude?: number;
            /** @example 1800 */
            travelTime?: number;
            /**
             * @example CAR
             * @enum {string}
             */
            travelMethod?: "CAR" | "WALKING";
            /** @example 2026-06-01T10:00:00.000Z */
            arriveAt?: string;
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            afterStopId?: string;
        };
        CreateTicketDto: {
            /** @example Entrada Museo del Prado */
            name: string;
            /** @example Entrada general para adultos */
            description?: string;
            /** @example https://example.com/ticket.pdf */
            objectUrl?: string;
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            tripItineraryId: string;
            /** @example d4e5f6a7-b890-1234-defa-234567890123 */
            expenseId?: string;
        };
        TicketOutputDto: {
            /** @example e5f6a7b8-9012-3456-efab-345678901234 */
            id: string;
            /** @example Entrada Museo del Prado */
            name: string;
            /** @example Entrada general para adultos */
            description?: Record<string, never>;
            /** @example https://example.com/ticket.pdf */
            objectUrl?: Record<string, never>;
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            tripItineraryId?: Record<string, never>;
            /** @example d4e5f6a7-b890-1234-defa-234567890123 */
            expenseId?: Record<string, never>;
            /**
             * Format: date-time
             * @example 2026-03-12T10:00:00.000Z
             */
            createdAt: string;
        };
        UpdateTicketDto: {
            /** @example Entrada Museo del Prado */
            name?: string;
            /** @example Entrada general para adultos */
            description?: string;
            /** @example https://example.com/ticket.pdf */
            objectUrl?: string;
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            tripItineraryId?: string;
            /** @example d4e5f6a7-b890-1234-defa-234567890123 */
            expenseId?: string;
        };
        CreateExpenseDto: {
            /** @description Identificador del miembro que realizó el pago. */
            payerId: string;
            /** @example 2026-06-05T14:30:00.000Z */
            paidAt: string;
            /** @example 45.5 */
            quantity: number;
            /**
             * @example [
             *       "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
             *       "b2c3d4e5-f6a7-8901-bcde-f12345678901"
             *     ]
             */
            payeeIds: string[];
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            tripItineraryId?: string;
        };
        ExpenseUserOutputDto: {
            /** @example b2c3d4e5-f6a7-8901-bcde-f12345678901 */
            id: string;
            /** @example Carlos */
            firstName: Record<string, never>;
            /** @example García López */
            lastName: Record<string, never>;
            /** @example carlos@example.com */
            email: string;
        };
        ExpenseOutputDto: {
            /** @example d4e5f6a7-b890-1234-defa-234567890123 */
            id: string;
            /**
             * Format: date-time
             * @example 2026-06-05T14:30:00.000Z
             */
            paidAt: string;
            /** @example 45.5 */
            quantity: number;
            payer: components["schemas"]["ExpenseUserOutputDto"];
            payees: components["schemas"]["ExpenseUserOutputDto"][];
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            tripItineraryId?: Record<string, never>;
            /**
             * Format: date-time
             * @example 2026-03-12T10:00:00.000Z
             */
            createdAt: string;
        };
        UpdateExpenseDto: {
            /** @description Identificador del miembro que realizó el pago. */
            payerId?: string;
            /** @example 2026-06-05T14:30:00.000Z */
            paidAt?: string;
            /** @example 45.5 */
            quantity?: number;
            /**
             * @example [
             *       "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
             *       "b2c3d4e5-f6a7-8901-bcde-f12345678901"
             *     ]
             */
            payeeIds?: string[];
            /** @example c3d4e5f6-a7b8-9012-cdef-123456789012 */
            tripItineraryId?: string;
        };
        /**
         * @description Estado del usuario en la plataforma.
         * @enum {string}
         */
        UserStatus: "BLOCKED" | "REJECTED" | "PENDING_REVIEW" | "PENDING_VERIFICATION" | "APPROVED" | "IMPORTED";
        UserInfoDTO: {
            /** @example https://example.com/kotrip/users/550e8400/avatars/avatar.webp */
            avatarUrl?: string;
            /** @example 15/1/2025, 12:20:12 */
            createdAt: string;
            /** @example correo1@hosting.com */
            email: string;
            /** @example 550e8400-e29b-41d4-a716-446655440000 */
            id: string;
            /** @example es */
            language: components["schemas"]["Language"];
            /** @example Carlos */
            firstName: string;
            /** @example García López */
            lastName: string;
            /** @example ADMIN */
            role: components["schemas"]["Role"];
            /**
             * @description Indica si el usuario tiene habilitada la autenticación de dos factores.
             * @example false
             */
            twoFactorEnabled: boolean;
            /**
             * @description Estado del usuario en la plataforma.
             * @example APPROVED
             */
            status: components["schemas"]["UserStatus"];
            /**
             * @description Fecha del último cambio de estado.
             * @example 2025-01-15T12:20:12.000Z
             */
            lastStatusChange?: Record<string, never>;
        };
        AllUsersOutputDto: {
            /** @description Lista de usuarios */
            user: components["schemas"]["UserInfoDTO"][];
        };
        UserOutputDto: {
            /** @example correo1@hosting.com */
            mail: string;
            /** @example USER */
            role: components["schemas"]["Role"];
        };
        AvatarOutputDTO: {
            /** @example avatar.png */
            file_name: string;
            /** @example true */
            status: boolean;
        };
        SuccessResponseDto: {
            /**
             * @description Indica si la operación se completó exitosamente
             * @example true
             */
            success: boolean;
        };
        UpdateUserDto: {
            /** @example correo1@hosting.com */
            mail?: string;
            /** @example es */
            language?: components["schemas"]["Language"];
            /** @example Carlos */
            firstName?: string;
            /** @example García López */
            lastName?: string;
            /** @example ADMIN */
            role?: components["schemas"]["Role"];
            /**
             * @description Indica si habilitar o deshabilitar la autenticación 2FA.
             * @example true
             */
            twoFactorCode?: boolean;
            /**
             * @description Estado del usuario en la plataforma. Solo modificable por administradores.
             * @example APPROVED
             */
            status?: components["schemas"]["UserStatus"];
        };
        UpdatePasswordDto: {
            /**
             * @description Current password
             * @example Old_Password_01
             */
            oldPassword: string;
            /** @example UnaPasswordMasFuerte1234_ */
            newPassword: string;
        };
        AdminResetPasswordDto: {
            /**
             * @description Nueva contraseña para el usuario
             * @example NuevaPassword1234_
             */
            password: string;
        };
        MailDto: {
            /** @example correo@hosting.com */
            mail: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    FileUserController_uploadFile: {
        parameters: {
            query: {
                encrypt: boolean;
            };
            header?: never;
            path: {
                /** @description Nombre del bucket sobre la que ejecutar el end-point */
                bucket: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description Archivo subido exitosamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadFileOutputDto"];
                };
            };
            /** @description Solicitud incorrecta */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error, el archivo está vacío */
            406: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FileUserController_deleteFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Nombre del bucket sobre la que ejecutar el end-point */
                bucket: string;
                /** @description ID del fichero a borrar */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Archivo eliminado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeleteFileOutputDto"];
                };
            };
        };
    };
    FileUserController_downloadFile: {
        parameters: {
            query: {
                decrypt: boolean;
            };
            header?: never;
            path: {
                /** @description ID del fichero a descargar */
                id: string;
                /** @description Nombre del bucket sobre la que ejecutar el end-point */
                bucket: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Archivo descargado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StreamableFile"];
                };
            };
            /** @description Archivo no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FileUserController_generateUrlFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description ID del fichero a descargar */
                id: string;
                /** @description Nombre del bucket sobre la que ejecutar el end-point */
                bucket: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description URL generada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileUrlOut"];
                };
            };
            /** @description Archivo no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FileUserController_getAll: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Nombre del bucket sobre la que ejecutar el end-point */
                bucket: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Archivos recuperados exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileOutputDto"][];
                };
            };
            /** @description Solicitud incorrecta */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FileUserController_getBucketsValues: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de buckets disponibles */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BucketInfoDto"][];
                };
            };
        };
    };
    FileExplorerLogsController_retrieveDirLogs: {
        parameters: {
            query?: {
                /** @description Ruta a la que acceder */
                path?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de directorios y archivos recuperada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileOutputDto"][];
                };
            };
        };
    };
    FileExplorerLogsController_retrieveLog: {
        parameters: {
            query: {
                /** @description Ruta y nombre del archivo de log que descargar */
                full_path: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Log descargado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StreamableFile"];
                };
            };
            /** @description Archivo no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            /** @description Inicio de sesión exitoso */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginOutputDto"];
                };
            };
            /** @description Credenciales incorrectas o falta email/contraseña */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Demasiadas solicitudes */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ThrotterGuardErrorDto"];
                };
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_register: {
        parameters: {
            query?: never;
            header: {
                /** @description Preferencia de idioma del usuario */
                "accept-language": "en" | "es" | "gl" | "en-US" | "en-GB" | "en-CA" | "en-AU" | "en-NZ" | "en-IE" | "en-ZA" | "en-IN" | "es-ES" | "es-MX" | "es-AR" | "es-CO" | "es-CL" | "es-PE" | "es-VE" | "es-EC" | "es-GT" | "es-CR" | "es-PA" | "es-DO" | "es-SV" | "es-HN" | "es-NI" | "es-PR" | "es-UY" | "es-PY" | "es-BO" | "es-CU" | "gl-ES";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NewRegisterDto"];
            };
        };
        responses: {
            /** @description Registro exitoso */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NewRegisterOutput"];
                };
            };
            /** @description Credenciales incorrectas */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El correo ya está en uso */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Demasiadas solicitudes */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ThrotterGuardErrorDto"];
                };
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_verifyEmail: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyEmailDto"];
            };
        };
        responses: {
            /** @description Verificación exitosa. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Código inválido o expirado */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Usuario o verificación no encontrada */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Demasiadas solicitudes */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ThrotterGuardErrorDto"];
                };
            };
        };
    };
    AuthController_refreshToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tokens de sesión renovados exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginOutputDto"];
                };
            };
            /** @description Token renovado */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_updateSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateSessionDto"];
            };
        };
        responses: {
            /** @description Sesión actualizada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginOutputDto"];
                };
            };
            /** @description Usuario no encontrado o datos inválidos */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LocalityController_search: {
        parameters: {
            query: {
                /** @description Prefijo del nombre del municipio a buscar */
                search: string;
                /** @description Numero maximo de resultados (por defecto 10, maximo 50) */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de localidades que coinciden con el prefijo */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Locality"][];
                };
            };
            /** @description Parametros de consulta invalidos */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_findAllTrips: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TripListOutputDto"][];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_createTrip: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTripDto"];
            };
        };
        responses: {
            /** @description Viaje creado exitosamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TripOutputDto"];
                };
            };
            /** @description Datos inválidos */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_findMyInvitations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitationOutputDto"][];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_respondInvitation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID de la invitación */
                invitationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RespondInvitationDto"];
            };
        };
        responses: {
            /** @description Respuesta procesada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitationOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado para responder */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invitación no encontrada */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_findOneTrip: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TripOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No es miembro del viaje */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_updateTrip: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTripDto"];
            };
        };
        responses: {
            /** @description Viaje actualizado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TripOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permiso denegado */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_removeTrip: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Viaje eliminado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permiso denegado */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_findAllMembers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TripMemberOutputDto"][];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_addMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTripMemberDto"];
            };
        };
        responses: {
            /** @description Miembro añadido exitosamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TripMemberOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Usuario ya es miembro */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_updateMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del miembro */
                memberId: string;
                /** @description UUID del viaje */
                id: unknown;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTripMemberDto"];
            };
        };
        responses: {
            /** @description Miembro actualizado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TripMemberOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_removeMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del miembro */
                memberId: string;
                /** @description UUID del viaje */
                id: unknown;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Miembro eliminado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_findAllInvitations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitationOutputDto"][];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_createInvitation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InviteMemberDto"];
            };
        };
        responses: {
            /** @description Invitación enviada exitosamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitationOutputDto"];
                };
            };
            /** @description No se puede invitar a sí mismo */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ya es miembro o invitación pendiente */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_findAllItineraryStops: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ItineraryOutputDto"][];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_addItineraryStop: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateItineraryStopDto"];
            };
        };
        responses: {
            /** @description Parada creada exitosamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ItineraryOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_reorderItinerary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderItineraryDto"];
            };
        };
        responses: {
            /** @description Itinerario reordenado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos de reorden inválidos */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_updateItineraryStop: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID de la parada */
                stopId: string;
                /** @description UUID del viaje */
                id: unknown;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateItineraryStopDto"];
            };
        };
        responses: {
            /** @description Parada actualizada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ItineraryOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_removeItineraryStop: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID de la parada */
                stopId: string;
                /** @description UUID del viaje */
                id: unknown;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Parada eliminada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_findAllTickets: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TicketOutputDto"][];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_createTicket: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTicketDto"];
            };
        };
        responses: {
            /** @description Ticket creado exitosamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TicketOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_updateTicket: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del ticket */
                ticketId: string;
                /** @description UUID del viaje */
                id: unknown;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTicketDto"];
            };
        };
        responses: {
            /** @description Ticket actualizado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TicketOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_removeTicket: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del ticket */
                ticketId: string;
                /** @description UUID del viaje */
                id: unknown;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Ticket eliminado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_findAllExpenses: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExpenseOutputDto"][];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_createExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del viaje */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateExpenseDto"];
            };
        };
        responses: {
            /** @description Gasto creado exitosamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExpenseOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_updateExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del gasto */
                expenseId: string;
                /** @description UUID del viaje */
                id: unknown;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateExpenseDto"];
            };
        };
        responses: {
            /** @description Gasto actualizado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExpenseOutputDto"];
                };
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TripController_removeExpense: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID del gasto */
                expenseId: string;
                /** @description UUID del viaje */
                id: unknown;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Gasto eliminado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No autorizado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_searchUsers: {
        parameters: {
            query: {
                /** @description Término de búsqueda */
                q: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserInfoDTO"][];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_getPaginatedUsers: {
        parameters: {
            query?: {
                /** @description Número de página */
                page?: number;
                /** @description Cantidad de elementos por página */
                pageSize?: number;
                /** @description Orden, formato: campo:direccion. Ej: createdAt:desc */
                sort?: string[];
                /** @description Correo del usuario a buscar */
                mail?: string;
                /** @description Nombre del usuario a buscar */
                firstName?: string;
                /** @description Apellidos del usuario a buscar */
                lastName?: string;
                /** @description Rol del usuario a filtrar */
                role?: "USER" | "ADMIN";
                /** @description Estado del usuario a filtrar */
                status?: "BLOCKED" | "REJECTED" | "PENDING_REVIEW" | "PENDING_VERIFICATION" | "APPROVED" | "IMPORTED";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AllUsersOutputDto"];
                };
            };
            /** @description Parámetros de consulta inválidos */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_profile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consulta exitosa */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOutputDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_uploadProfilePic: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description Foto de perfil subida exitosamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Solicitud incorrecta */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvatarOutputDTO"];
                };
            };
        };
    };
    UserController_downloadProfilePic: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Foto de perfil descargada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StreamableFile"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Archivo no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_updateTwoFA: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 2FA actualizado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Usuario no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_updateAnyUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description ID del usuario a actualizar */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserDto"];
            };
        };
        responses: {
            /** @description Usuario actualizado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permiso denegado */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Usuario no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_updatePassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePasswordDto"];
            };
        };
        responses: {
            /** @description Contraseña actualizada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
            };
            /** @description Contraseña anterior inválida */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Usuario no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_updateUserStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description ID del usuario a actualizar */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * @description Nuevo estado del usuario
                     * @example BLOCKED
                     * @enum {string}
                     */
                    status: "BLOCKED" | "REJECTED" | "PENDING_REVIEW" | "PENDING_VERIFICATION" | "APPROVED" | "IMPORTED";
                };
            };
        };
        responses: {
            /** @description Estado del usuario actualizado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Usuario no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No se puede modificar el estado del propio usuario */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_adminResetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description ID del usuario al que reiniciar la contraseña */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminResetPasswordDto"];
            };
        };
        responses: {
            /** @description Contraseña reiniciada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Usuario no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No se puede cambiar la propia contraseña */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_deleteProfilePic: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Foto de perfil eliminada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Foto de perfil no encontrada */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_deleteUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MailDto"];
            };
        };
        responses: {
            /** @description Usuario eliminado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permiso denegado */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Usuario no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UserController_desactivateUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Usuario eliminado exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permiso denegado */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Usuario no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Error interno del servidor */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    I18nValidatorController_getMissingTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    I18nValidatorController_getI18nStatistics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    I18nValidatorController_getCompletelyMissingTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
