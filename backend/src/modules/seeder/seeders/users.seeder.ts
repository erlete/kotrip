import * as fs from 'node:fs';
import * as path from 'node:path';
import { getUserAvatarPath, KOTRIP_BUCKET, Language, Role } from '@kotrip/data';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import FileService from '../../files/services/file-service.service';
import { User } from '../../user/entities/user.entity';
import { BaseSeeder } from './base.seeder';

/** Número de imágenes de muestra disponibles para avatares */
const SAMPLE_IMAGES_COUNT = 5;

/**
 * Estructura de datos de entrada para usuarios.
 */
interface UserSeedData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Role;
  language: Language;
}

/**
 * Seeder de usuarios.
 *
 * Siembra usuarios iniciales del sistema con contraseñas hasheadas.
 * Crea usuarios con sus roles, preferencias de idioma y buckets de MinIO.
 * Asigna avatares aleatorios de las imágenes de muestra disponibles.
 * Mantiene un mapa email->UUID para uso por otros seeders.
 */
@Injectable()
export class UsersSeeder extends BaseSeeder<UserSeedData> {
  protected readonly entityName = 'Users';
  protected readonly inputFileName = 'users.json';

  /** Mapa para almacenar email de usuario -> UUID real */
  private userEmailToIdMap = new Map<string, string>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileService: FileService,
  ) {
    super('UsersSeeder');
  }

  /**
   * Obtiene el mapa de email a UUID de usuario para uso por otros seeders.
   */
  getUserEmailToIdMap(): Map<string, string> {
    return new Map(this.userEmailToIdMap);
  }

  /**
   * Seed users from input data.
   * Crea usuarios, sus buckets de MinIO y asigna avatares aleatorios.
   */
  async seed(): Promise<void> {
    this.logger.debug(`Starting ${this.entityName} seeding...`);

    const data = await this.loadData();

    if (data.length === 0) {
      this.logger.warn('No users to seed');
      return;
    }

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < data.length; i++) {
      const userData = data[i];

      try {
        // Check if user already exists
        const existing = await this.userRepository.findOne({
          where: { email: userData.email },
        });

        if (existing) {
          this.logger.debug(
            `User ${userData.email} already exists, skipping...`,
          );
          // Guardar mapeo para usuarios existentes
          this.userEmailToIdMap.set(userData.email, existing.id);
          skipped++;
          continue;
        }

        // Hash password
        const hashedPassword = await this.hashPassword(userData.password);

        // Create user entity
        const user = this.userRepository.create({
          email: userData.email,
          firstName: userData.firstName,
          language: userData.language,
          lastName: userData.lastName,
          password: hashedPassword,
          role: userData.role,
        });

        // Save user
        const saved = await this.userRepository.save(user);
        this.userEmailToIdMap.set(userData.email, saved.id);

        // Subir avatar aleatorio al bucket único
        try {
          // Subir avatar aleatorio
          const avatarFileName = await this.uploadRandomAvatar(saved.id);
          if (avatarFileName) {
            saved.avatarFileName = avatarFileName;
            await this.userRepository.save(saved);
          }
        } catch (bucketError) {
          this.logger.warn(
            `Failed to create bucket or avatar for user ${userData.email}: ${bucketError}`,
          );
          // No hacer rollback del usuario, solo avisar
        }

        created++;
        this.reportProgress(i + 1, data.length, userData.email);
      } catch (error) {
        this.reportError(
          error instanceof Error ? error : new Error(String(error)),
          userData.email,
        );
        skipped++;
      }
    }

    this.reportComplete(created, skipped);
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(plainPassword: string): Promise<string> {
    const saltRounds = 10;
    return hash(plainPassword, saltRounds);
  }

  /**
   * Sube una imagen de muestra aleatoria como avatar del usuario.
   *
   * @param userId      ID del usuario
   * @returns           Nombre del archivo subido o null si falla
   */
  private async uploadRandomAvatar(userId: string): Promise<string | null> {
    try {
      // Seleccionar imagen aleatoria (1-5)
      const imageIndex = Math.floor(Math.random() * SAMPLE_IMAGES_COUNT) + 1;
      const imageName = `sample-image-${imageIndex}.png`;

      // Calcular la ruta a los archivos de inputs
      const inputsBasePath = path.join(__dirname, '..', 'inputs');
      const imagePath = path.join(inputsBasePath, 'files', imageName);

      // Verificar que el archivo existe
      if (!fs.existsSync(imagePath)) {
        this.logger.warn(`Sample image not found: ${imagePath}`);
        return null;
      }

      // Leer el archivo
      const fileBuffer = fs.readFileSync(imagePath);

      // Generar nombre de archivo basado en hash
      const hash = FileService.generateFileHash(fileBuffer);
      const fileName = `${hash}.png`;

      // Subir al bucket único usando la ruta de avatar del usuario
      await this.fileService.uploadFile(
        KOTRIP_BUCKET,
        [getUserAvatarPath(userId, fileName)],
        fileBuffer,
        'image/png',
        false,
      );

      return fileName;
    } catch (error) {
      this.logger.warn(`Failed to upload avatar for user ${userId}: ${error}`);
      return null;
    }
  }
}
