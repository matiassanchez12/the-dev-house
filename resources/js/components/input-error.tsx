import { HTMLAttributes } from 'react';

interface InputErrorProps extends HTMLAttributes<HTMLParagraphElement> {
    message?: string;
}

export default function InputError({ message, className = '', ...props }: InputErrorProps) {
    return message ? (
        <p
            {...props}
            className={'text-sm text-red-600 ' + className}
        >
            {message}
        </p>
    ) : null;
}
