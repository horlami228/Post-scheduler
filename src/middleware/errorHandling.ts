// Error handling middleware
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error{
    statusCode?: number;
    customMessage?: string;
    cleanUp?: () => void;
}

 function errorHandlingMiddleware(error: CustomError, req: Request, res: Response, next: NextFunction): void {
    const statusCode = error.statusCode || 500;
    const clientMessage = error.customMessage || 'An unexpected error occurred. Please try again later.';
    const internalDetails = {
        message: error.message,
        stack: error.stack,
        cleanUp: error.cleanUp
    }

    // log full error to console
    console.error('Full error:', internalDetails);

    // send client message

    res.status(statusCode).json({ error: clientMessage });
 }

export default errorHandlingMiddleware;
