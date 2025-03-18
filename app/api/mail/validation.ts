import * as yup from "yup";

export const mailValidationSchema = yup.object({
    name: yup.string().trim().min(3, "Name must be at least 3 characters").max(50, "Name cannot exceed 50 characters").required("Name is required"),
    email: yup.string().trim().email("Invalid email format").required("Email is required"),
    subject: yup.string().trim().min(3, "Subject must be at least 3 characters").max(100, "Subject cannot exceed 100 characters").required("Subject is required"),
    message: yup.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message cannot exceed 1000 characters").required("Message is required"),
});

export type MailRequestBody = {
    name: string;
    email: string;
    subject: string;
    message: string;
};