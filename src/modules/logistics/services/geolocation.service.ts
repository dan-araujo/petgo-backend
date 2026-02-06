import { Injectable } from "@nestjs/common";

@Injectable()
export class GeolocationService {

    private readonly EARTH_RADIUS_KM = 6371;

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

    isWithinRange(distanceKm: number, maxRadiusKm: number): boolean {
        return distanceKm <= maxRadiusKm;
    }

    calculateFee(distanceKm: number, baseFee: number, feePerKm: number): number {
        const total = Number(baseFee) + (distanceKm * Number(feePerKm));
        return Math.round(total * 100) / 100;
    }

}