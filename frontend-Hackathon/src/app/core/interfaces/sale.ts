export interface ISale {
    id: number;
    dateSale: string; // Utilizando Date como tipo para la fecha
    customerId: number;
    sellerId: number;
    paymentMethod: string;
    status: string;
    saleDetails: {
      id: number;
      productId: number;
      amount: number;
      saleCost: number;
      sale: string;
    }[]; // Array de objetos con los detalles de la venta
  }
  