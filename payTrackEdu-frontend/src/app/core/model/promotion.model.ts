export type PromotionResponse = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  createdBy: string;
  createdAt: Date;
};

export type PromotionRequest = {
  code: string;
  name: string;
  active: boolean;
};
