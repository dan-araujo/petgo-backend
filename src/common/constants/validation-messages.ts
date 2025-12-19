export const ValidationMessages = {

    MINIMUM_SIZE: (min: number) => `Este campo deve ter pelo menos ${min} caracteres.`,
    MAXIMUM_SIZE: (max: number) => `Este campo deve ter no máximo ${max} caracteres.`,
    SHORT_PASSWORD: (min: number) => `A senha deve ter pelo menos ${min} caracteres.`,
    SHORT_NAME: 'O nome deve ter pelo menos 3 caracteres.',

    REQUIRED_FIELD: 'Este campo é obrigatório.',
    REQUIRED_NAME: 'O nome é obrigatório.',
    REQUIRED_PHONE: 'Telefone é obrigatório',
    REQUIRED_PASSWORD: 'A senha é obrigatoria.',
    REQUIRED_CNPJ: 'Preencha seu CNPJ',
    REQUIRED_CPF: 'Preencha seu CPF',
    REQUIRED_EMAIL: 'O e-mail é obrigatório.',
 
    INVALID_EMAIL: 'O e-mail informado é inválido.',
    INVALID_PHONE: 'O telefone informado é inválido.',
    INVALID_CATEGORY: 'Selecione uma das opções',
    INVALID_CPF: 'O CPF informado é inválido.',
    INVALID_CNPJ: 'O CNPJ informado é inválido',

    EMAIL_ALREADY_EXISTS: 'Já existe um cadastro com este e-mail',
    PHONE_ALREADY_EXISTS: 'Já existe um cadastro com este telefone.',
    CNPJ_ALREADY_EXISTS: 'Já existe uma loja com este CNPJ',
    CPF_ALREADY_EXISTS: 'CPF já cadastrado'
};