export interface Promotion {
    promoId: number,
    code: string,
    description: string,
    discountPercent: number,
    startDate: Date,
    endDate: Date,
    isActive: boolean
}