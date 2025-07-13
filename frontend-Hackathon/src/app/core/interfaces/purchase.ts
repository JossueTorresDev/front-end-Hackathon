export interface IPurchase{
id: number;
datePurchase: Date; // Utilizando Date como tipo para la fecha
name: string;
lastName: string;
phone: string;
address: string;
operationType: string;
status: string;
purchaseDetails:{
  id: number;
  purchaseId: number;
  productId: number;
  productQuantity: number;
  purchasePrice: number;
  subtotal: number;
}[];
}