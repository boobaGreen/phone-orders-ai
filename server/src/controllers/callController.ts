import { Request, Response } from "express";
import twilioService from "../services/twilioService";

// Gestisce una chiamata in entrata tramite Twilio
export const handleIncomingCall = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Ottieni il numero di telefono del chiamante e l'ID del business
    const customerPhone = req.body.From || "";
    const businessId = req.query.businessId as string;

    if (!businessId) {
      res
        .status(400)
        .send(
          twilioService.generateErrorResponse(
            "No business ID provided. Please try again."
          )
        );
      return;
    }

    // Genera la risposta TwiML
    const twimlResponse = await twilioService.handleIncomingCall(
      customerPhone,
      businessId
    );

    // Invia la risposta TwiML
    res.type("text/xml");
    res.send(twimlResponse);
  } catch (error) {
    console.error("Error handling incoming call:", error);
    res.type("text/xml");
    res.send(
      twilioService.generateErrorResponse(
        "An error occurred. Please try again later."
      )
    );
  }
};

// Gestisce la risposta del cliente durante la chiamata
export const handleCallResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Ottieni l'ID dell'ordine e l'input vocale
    const orderId = req.query.orderId as string;
    const customerInput = req.body.SpeechResult || "";

    if (!orderId) {
      res
        .status(400)
        .send(
          twilioService.generateErrorResponse(
            "No order ID provided. Please try again."
          )
        );
      return;
    }

    // Genera la risposta TwiML in base all'input del cliente
    const twimlResponse = await twilioService.processVoiceInput(
      orderId,
      customerInput
    );

    // Invia la risposta TwiML
    res.type("text/xml");
    res.send(twimlResponse);
  } catch (error) {
    console.error("Error handling call response:", error);
    res.type("text/xml");
    res.send(
      twilioService.generateErrorResponse(
        "An error occurred. Please try again later."
      )
    );
  }
};
