const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'API de Wacdo Back-Office',
			version: '1.0.0',
			description: 'Documentation de l\'API pour la gestion du back-office Wacdo',
		},
		servers: [
			{
				url: 'http://localhost:3030',
			},
		],
	},
	apis: ['./routes/*.js'], // Chemins vers les fichiers contenant les annotations Swagger
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;