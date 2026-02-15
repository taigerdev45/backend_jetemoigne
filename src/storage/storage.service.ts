import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
    private supabase: SupabaseClient;
    private readonly logger = new Logger(StorageService.name);

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_KEY || '',
        );
    }

    /**
     * Uploader un fichier vers un bucket Supabase
     */
    async uploadFile(file: any, bucket: string): Promise<string> {
        if (!file) throw new Error('Aucun fichier fourni');

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            this.logger.error(`Erreur d'upload Supabase: ${error.message}`);
            throw new Error(`Upload échoué: ${error.message}`);
        }

        const { data: publicUrlData } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrlData.publicUrl;
    }

    /**
     * Supprimer un fichier d'un bucket Supabase
     */
    async deleteFile(filePath: string, bucket: string): Promise<void> {
        const { error } = await this.supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            this.logger.error(`Erreur de suppression Supabase: ${error.message}`);
        }
    }
}
