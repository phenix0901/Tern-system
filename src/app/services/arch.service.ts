import axios, {AxiosRequestConfig, AxiosResponse} from "axios";

import {Res} from "@/app/types/service";

import {BaseService} from "@/app/services/base.service";
import {ARCode} from "@/app/types/arcode";


interface IARCHService {
    postGenerateQR(moduleColor: string, backgroundColor: string): Promise<Res<{ url: string; id: string }>>;

    postSaveQR(email: string, name: string, isEdit: boolean, mediaId?: string, backgroundColor?: string, moduleColor?: string, qrFile?: File, video?: File): Promise<Res>;

    getListQRs(email: string): Promise<Res<ARCode[]>>;

    getQrDetails(email: string, mediaId: string): Promise<Res<ARCode>>;

    deleteQr(email: string, mediaId: string): Promise<Res>;
}

class ARCHServiceImpl extends BaseService implements IARCHService {
    constructor() {
        super(ARCHServiceImpl.name)
    }

    async getQrDetails(email: string, mediaId: string): Promise<Res<ARCode>> {
        const [debug, error] = this.getLoggers(this.getQrDetails.name);

        const config: AxiosRequestConfig = {
            method: 'GET',
            url: this._API + `get-qr-details/` + mediaId,
            params: {user: email},
            withCredentials: true,
        };

        let response: AxiosResponse;
        try {
            debug(config);
            response = await axios(config);
            debug(response);
        } catch (err: unknown) {
            error(err);
            throw axios.isAxiosError(err) ? err.message : 'Unexpected error!';
        }

        if (!Object.hasOwn(response.data, 'qrCodeUrl'))
            throw 'Received wrong response schema from the server'

        return {payload: response.data};
    }

    async postGenerateQR(moduleColor: string, backgroundColor: string): Promise<Res<{ url: string; id: string }>> {
        const [debug, error] = this.getLoggers(this.postGenerateQR.name);

        const config: AxiosRequestConfig = {
            method: 'POST',
            url: this._API + `generate-qr`,
            headers: {'Content-Type': 'application/json',},
            data: JSON.stringify({data: 'sample data', moduleColor, backgroundColor}),
            withCredentials: true,
        };

        try {
            debug(config);
            const response = await axios(config);
            debug(response);
            return {payload: {url: response.data.qrCode?.qrDataUrl, id: response.data.qrCode?.mediaId}};
        } catch (err: unknown) {
            error(err);
            throw axios.isAxiosError(err) ? err.message : 'Unexpected error!';
        }
    }

    async postSaveQR(email: string, name: string, isEdit: boolean, mediaId?: string, backgroundColor?: string, moduleColor?: string, qrFile?: File, video?: File): Promise<Res> {
        const [debug, error] = this.getLoggers(this.postSaveQR.name);

        const formData = new FormData();
        formData.append('user', email);
        formData.append('fileName', name);
        formData.append('isEdit', isEdit.toString());

        if (mediaId)
            formData.append('mediaId', mediaId);
        if (backgroundColor)
            formData.append('backgroundColor', backgroundColor);
        if (moduleColor)
            formData.append('moduleColor', moduleColor);
        if (qrFile)
            formData.append('media', qrFile);
        if (video)
            formData.append('video', video);


        const config: AxiosRequestConfig = {
            method: 'POST',
            url: this._API + `save-qr`,
            headers: {'Content-Type': 'multipart/form-data'},
            data: formData,
            withCredentials: true,
        };

        try {
            debug(config);
            debug(Object.fromEntries(Array.from(formData)));
            const response = await axios(config);
            debug(response);
        } catch (err: unknown) {
            error(err);
            throw axios.isAxiosError(err) ? err.message : 'Unexpected error!';
        }
    }

    async getListQRs(email: string): Promise<Res<ARCode[]>> {
        const [debug, error] = this.getLoggers(this.getListQRs.name);

        const config: AxiosRequestConfig = {
            method: 'GET',
            url: this._API + `list-qr-codes`,
            params: {user: email},
            withCredentials: true,
        };

        try {
            debug(config);
            const response = await axios(config);
            debug(response);
            return {payload: response.data.qrCodes};
        } catch (err: unknown) {
            error(err);
            throw axios.isAxiosError(err) ? err.message : 'Unexpected error!';
        }
    }

    async deleteQr(email: string, mediaId: string): Promise<Res> {
        const [debug, error] = this.getLoggers(this.deleteQr.name);

        const config: AxiosRequestConfig = {
            method: 'DELETE',
            url: this._API + `delete-qr/` + mediaId,
            params: {user: email},
            withCredentials: true,
        };

        try {
            debug(config);
            const response = await axios(config);
            debug(response);
        } catch (err: unknown) {
            error(err);
            throw axios.isAxiosError(err) ? err.message : 'Unexpected error!';
        }
    }

}

const ARCHService = new ARCHServiceImpl();
export {ARCHService};
