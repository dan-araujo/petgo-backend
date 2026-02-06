import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class GeolocationService {
    private readonly logger = new Logger(GeolocationService.name);
    private readonly EARTH_RADIUS_KM = 6371;
    private userAgent = 'PetGoApp/1.0 (petgo.noreply@gmail.com)';

    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const deltaLat = this.degreesToRadians(lat2 - lat1);
        const deltaLon = this.degreesToRadians(lon2 - lon1);
        const halfChordLengthSquared =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const angularDistanceRadians = 2 * Math.atan2(Math.sqrt(halfChordLengthSquared), Math.sqrt(1 - halfChordLengthSquared));

        return this.EARTH_RADIUS_KM * angularDistanceRadians;
    }

    private degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    async getCoordinatesFromAddress(fullAddress: string): Promise<{ lat: number, lon: number } | null> {
        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: fullAddress,
                    format: 'json',
                    addressdetails: 1,
                    limit: 1,
                },
                headers: {
                    'User-Agent': this.userAgent,
                },
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                return {
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon),
                };
            }

            this.logger.warn(`Endereço não encontrado no OSM: ${fullAddress}`);
            return null;
        } catch (error) {
            this.logger.error(`Erro ao buscar geolocalização: ${error.message}`);
            return null;
        }
    }

    isWithinRange(distanceKm: number, maxRadiusKm: number): boolean {
        return distanceKm <= maxRadiusKm;
    }

    calculateFee(distanceKm: number, baseFee: number, feePerKm: number): number {
        const total = Number(baseFee) + (distanceKm * Number(feePerKm));
        return Math.round(total * 100) / 100;
    }

}