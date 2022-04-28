export const messagesValidation = {
  isNotBlank: (param: string) => {
    return `o campo ${param} não pode estar vazio`;
  },
  minLength: (param: string, value: number) => {
    return `${param} precisa ter no minimo ${value} caracteres`;
  },
  maxLength: (param: string, value: number) => {
    return `${param} só pode ter no maximo ${value} caracteres`;
  },
  isNumber: (param: string) => {
    return `o campo ${param} precisa ser um valor numerico`;
  },
  isDate: (param: string) => {
    return `o campo ${param} precisa ser uma data`;
  },
};
