import axios from "axios";

const API_BASE =
    "http://127.0.0.1:8000/api";

export async function generateTrip(
    payload
) {

    const response =
        await axios.post(
            `${API_BASE}/generate-trip/`,
            payload
        );

    return response.data;
}