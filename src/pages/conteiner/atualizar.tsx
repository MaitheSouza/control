import {
	Autocomplete,
	Box,
	Button,
	createFilterOptions,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { Conteiner } from '@prisma/client';
import { GetServerSideProps, NextPage } from 'next';
import { FormEvent, useState } from 'react';
import { formToObject, prisma, redirectWithQuery } from 'utils';
import { validate } from 'validation-br/dist/cnpj';
import * as yup from 'yup';

type Props = {
	cnpjs: string[];
	conteiner: Conteiner;
	id: string;
};

type Fields = {
	cnpj: string;
	numero: string;
	tipo: 20 | 40;
	status: 'Cheio' | 'Vazio';
	categoria: 'Importação' | 'Exportação';
};

const tipos = [20, 40];
const status = ['Cheio', 'Vazio'];
const categorias = ['Importação', 'Exportação'];

const validarNumeroDoConteiner = async (value: string | undefined) => {
	if (!value || value.length !== 11) return false;
	if (value.replaceAll(/[^A-Z]/g, '').length !== 4) return false;
	if (value.replaceAll(/[^0-9]/g, '').length !== 7) return false;
	return true;
};

const filter = createFilterOptions<string>();

const schema = yup.object().shape({
	cnpj: yup
		.string()
		.required('O CNPJ é obrigatório')
		.test('cnpj-validator', 'O CNPJ deve ser válido', validate as any),
	numero: yup
		.string()
		.required('O número do conteiner é obrigatório')
		.test(
			'validate-number',
			'O número do conteiner deve conter 4 letras e 7 números',
			validarNumeroDoConteiner
		),
	tipo: yup
		.number()
		.required('O tipo é obrigatório')
		.test('validate-test', 'O tipo é inválido', async (value) => {
			return tipos.includes(value || 0);
		}),
	categoria: yup
		.string()
		.required('A categoria é obrigatória')
		.test('validate-categoria', 'A categoria é inválida', async (value) => {
			return categorias.includes(value || '');
		}),
	status: yup
		.string()
		.required('O status é obrigatório')
		.test('validate-status', 'O status é inválido', async (value) => {
			return status.includes(value || '');
		}),
});

const Atualizar: NextPage<Props> = ({ conteiner, id, cnpjs }) => {
	const [value, setValue] = useState(conteiner.cnpj);
	const [inputValue, setInputValue] = useState('');
	const [errors, setErrors] = useState<Fields | any>({});
	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setErrors({});
		e.preventDefault();
		const body = formToObject<Fields>(e.target);
		try {
			await schema.validate(body, { abortEarly: false });
			window.location.replace(`?id=${id}&${redirectWithQuery(body)}`);
		} catch (err) {
			const errors: any = {};
			if (err instanceof yup.ValidationError) {
				err.inner.forEach((e) => {
					if (!errors[e.path!]) {
						errors[e.path!] = e.errors[0];
					}
				});
			}
			setErrors(errors);
		}
	};
	return (
		<Stack px={4} alignItems="center" justifyContent="center" component="main">
			<Typography margin="1rem 0" variant="h5" component="h1">
				Atualizar um conteiner
			</Typography>
			<Stack
				onSubmit={handleSubmit}
				spacing={2}
				width="100%"
				maxWidth="500px"
				component="form"
			>
				<FormControl error={!!errors.cnpj} component="fieldset">
					<Autocomplete
						value={value}
						onChange={(e, value) =>
							setValue(value?.replace(/[^0-9]/g, '') ?? '')
						}
						inputValue={inputValue}
						onInputChange={(e, value) =>
							setInputValue(value?.replace(/[^0-9]/g, '') ?? '')
						}
						filterOptions={(cnpjs, params) => {
							const filtered = filter(cnpjs, params);
							const isExistingCnpj = cnpjs.some(
								(cnpj) => cnpj === params.inputValue
							);
							if (!isExistingCnpj && params.inputValue.length === 14) {
								filtered.push(`Adicionar ${params.inputValue}`);
							}
							return filtered;
						}}
						isOptionEqualToValue={() => true}
						fullWidth
						options={cnpjs}
						getOptionLabel={(cnpj) => cnpj}
						renderOption={(props, cnpj) => {
							return (
								<Box component="li" {...props}>
									{cnpj}
								</Box>
							);
						}}
						renderInput={(params) => {
							return (
								<TextField
									{...params}
									name="cnpj"
									label="Digite ou adicione um CNPJ"
									inputProps={{ ...params.inputProps, maxLength: 14 }}
								/>
							);
						}}
					/>
					{errors.cnpj && (
						<FormHelperText color="error">{errors.cnpj}</FormHelperText>
					)}
				</FormControl>
				<FormControl error={!!errors.numero} component="fieldset">
					<TextField
						defaultValue={conteiner.numero}
						error={!!errors.numero}
						onChange={(e) => {
							e.target.value = e.target.value
								.replace(/[^0-9A-Za-z]/g, '')
								.toUpperCase();
						}}
						name="numero"
						variant="outlined"
						label="Número do conteiner"
						inputProps={{ maxLength: 11 }}
					/>
					{errors.numero && (
						<FormHelperText color="error">{errors.numero}</FormHelperText>
					)}
				</FormControl>
				<FormControl error={!!errors.tipo} component="fieldset">
					<InputLabel>Tipo</InputLabel>
					<Select
						defaultValue={conteiner.tipo}
						error={!!errors.tipo}
						labelId="Tipo"
						label="Tipo"
						name="tipo"
					>
						{tipos.map((tipo) => {
							return (
								<MenuItem key={tipo} value={tipo}>
									{tipo}
								</MenuItem>
							);
						})}
					</Select>
					{errors.tipo && (
						<FormHelperText color="error">{errors.tipo}</FormHelperText>
					)}
				</FormControl>
				<FormControl error={!!errors.status} component="fieldset">
					<InputLabel>Status</InputLabel>
					<Select
						defaultValue={conteiner.status}
						error={!!errors.status}
						labelId="Status"
						label="Status"
						name="status"
					>
						{status.map((s) => {
							return (
								<MenuItem key={s} value={s}>
									{s}
								</MenuItem>
							);
						})}
					</Select>
					{errors.status && (
						<FormHelperText color="error">{errors.status}</FormHelperText>
					)}
				</FormControl>
				<FormControl error={!!errors.categoria} component="fieldset">
					<InputLabel>Categoria</InputLabel>
					<Select
						defaultValue={conteiner.categoria}
						error={!!errors.categoria}
						labelId="Categoria"
						label="Categoria"
						name="categoria"
					>
						{categorias.map((categoria) => {
							return (
								<MenuItem key={categoria} value={categoria}>
									{categoria}
								</MenuItem>
							);
						})}
					</Select>
					{errors.categoria && (
						<FormHelperText color="error">{errors.categoria}</FormHelperText>
					)}
				</FormControl>
				<Button sx={{ margin: '1rem 0' }} type="submit" variant="contained">
					Atualizar
				</Button>
			</Stack>
		</Stack>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const { id, numero, tipo, categoria, status } = query as any;
	if (id && numero && tipo && categoria && status) {
		try {
			await schema.validate(query);
			query.tipo = Number(query.tipo) as any;
			const conteiner = await prisma.conteiner.update({
				data: query as any,
				where: {
					id,
				},
			});
			prisma.$disconnect;
			return {
				redirect: {
					permanent: false,
					destination: `/conteiner?cnpj=${conteiner.cnpj}`,
				},
			};
		} catch (err) {
			prisma.$disconnect;
		}
	}
	if (id) {
		const conteiner = await prisma.conteiner.findFirst({
			select: {
				cnpj: true,
				numero: true,
				tipo: true,
				categoria: true,
				status: true,
			},
			where: {
				id,
				movimentacao: {
					isNot: null,
				},
			},
		});
		prisma.$disconnect;
		if (!conteiner) {
			return {
				redirect: {
					permanent: false,
					destination: `/conteiner`,
				},
			};
		}
		const cnpjs = (
			await prisma.conteiner.findMany({
				select: {
					cnpj: true,
				},
				distinct: ['cnpj'],
				where: {
					movimentacao: {
						isNot: null,
					},
				},
			})
		).map((obj) => obj.cnpj);
		prisma.$disconnect;
		return {
			props: {
				conteiner,
				id,
				cnpjs,
			},
		};
	}
	if (Object.keys(query).length > 0) {
		return {
			redirect: {
				permanent: false,
				destination: `/conteiner`,
			},
		};
	}

	return {
		redirect: {
			permanent: false,
			destination: `/conteiner`,
		},
	};
};

export default Atualizar;
