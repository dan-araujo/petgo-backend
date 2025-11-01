export const ValidationMessages = {
    // Campos genéricos
    REQUIRED_FIELD: 'Este campo é obrigatório.',
    MINIMUM_SIZE: (min: number) => `Este campo deve ter pelo menos ${min} caracteres.`,
    MAXIMUM_SIZE: (max: number) => `Este campo deve ter no máximo ${max} caracteres.`,

    // Autenticação
    INVALID_EMAIL: 'O e-mail informado é inválido.',
    SHORT_PASSWORD: (min: number) => `A senha deve ter pelo menos ${min} caracteres.`,
    REQUIRED_PASSWORD: 'A senha é obrigatoria.',

    // Campos de loja, cliente e etc...
    REQUIRED_NAME: 'O nome é obrigatório.',
    REQUIRED_PHONE: 'Telefone é obrigatório',
    SHORT_NAME: 'O nome deve ter pelo menos 3 caracteres.',
    INVALID_CATEGORY: 'A categoria deve ser PETSHOP OU FEED_STORE',
    INVALID_CPF: 'O CPF informado é inválido.',
    INVALID_CNPJ: 'O CNPJ informado é inválido',

    // Outros
    EMAIL_ALREADY_EXISTS: 'Já existe um cadastro com este e-mail',
    PHONE_ALREADY_EXISTS: 'Já existe um cadastro com este telefone.',
    CNPJ_ALREADY_EXISTS: 'Já existe uma loja com este CNPJ',
    CPF_ALREADY_EXISTS: 'CPF já cadastrado'
};