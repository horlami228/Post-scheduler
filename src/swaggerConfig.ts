// Import the swaggerJsDoc module
import swaggerJsDoc from 'swagger-jsdoc';

/**
 * Swagger configuration options.
 * 
 * This configuration object sets up the Swagger documentation for the Veenote API.
 * 
 * The 'definition' object includes:
 * - `openapi`: Specifies the OpenAPI Specification (OAS) version for the documentation.
 * - `info`: Provides metadata about the API such as title, version, and a brief description.
 *     - `title`: Title of the API documentation, visible in Swagger UI.
 *      - `version`: Current version of the API.
 *      - `description`: Brief description of the API's purpose.
 * 
 * The 'apis' property specifies the path to YAML files containing API documentation.
 * The pattern './src/api_documentation/&#42;&#42;/&#42;.yml includes all YAML files within any
 * subdirectories under 'src/api_documentation'. This structure organizes the Swagger
 * documentation across multiple files for maintainability.
 */

const options = {
    definition: {
        openapi: '3.0.2',
        info: {
            title: 'Scheduler API',
            version: '1.0.0',
            description: 'An automation tool for scheduling and managing social media posts. It is integrated with Gemini AI for generative caption for media.',
            contact: {
                name: 'Akintola Olamilekan',
                email: 'akintolaolamilekan51@gmail.com',
                url: 'portfolio-infiniteglitch.vercel.app'
            }
        },
        servers: [
            {
                url: 'http://localhost:8000',
                description: 'Development server'
            },
            {
                url: 'https://scheduler-api.vercel.app',
                description: 'Production server'
            }
        ]
    },
    apis: ['./src/api_documentation/**/*.yml']
};

// Generate the Swagger specification from the provided options
const swaggerSpec = swaggerJsDoc(options);

// Export the Swagger specification for use elsewhere in the application
export default swaggerSpec;
