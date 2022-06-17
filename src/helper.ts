import axios from "axios";
import { IProfileList } from "./@types/ProfileList";

export const fetchDataFromAPI = (path : string) => {
    return fetch(path)
        .then((response) => response.json())
        .then((response) => {
            return response;
        })
        .catch(() => {
            
        });
};

export const patchDataOnServer = (path : string, profile: IProfileList) => {
    return axios.patch(path, profile)
        .then((response) => response)
        .then((response) => {
            return response;
        })
        .catch(() => {
            
        });
};