
// export const BASE_URL = "https://mockcrux-backend.onrender.com" || "http://localhost:8000"
export const BASE_URL = "http://localhost:3000"

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GOOGLE_LOGIN: "/api/auth/google",
        GET_PROFILE: "/api/auth/profile",
        UPDATE_PROFILE: "/api/auth/update-profile"
    },

    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image",
    },

    AI: {
        GENERATE_QUESTIONS: "/api/ai/generate-questions",
        GENERATE_EXPLANATIONS: "/api/ai/generate-explanation",
    },

    SESSION: {
        CREATE: "/api/sessions/create",
        GET_ALL: "/api/sessions/my-sessions",
        GET_ONE: (id) => `/api/sessions/${id}`,
        DELETE: (id) => `/api/sessions/${id}`,
    },

    QUESTION: {
        ADD_TO_SESSION: "/api/questions/add",
        PIN: (id) => `/api/questions/${id}/pin`,
        UPDATE_NOTE: (id) => `/api/questions/${id}/note`,
    },

    PAYMENT: {
        CREATE_ORDER: "/api/payments/create-order",
        VERIFY: "/api/payments/verify-payment",
        HISTORY: "/api/payments/history",
        SUBSCRIPTION_STATUS: "/api/payments/subscription-status"
    }
};
