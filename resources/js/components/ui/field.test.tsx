import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field } from './field';

describe('Field', () => {
    it('wires the child input to the error message', () => {
        render(
            <Field id="email" label="Email" error="Email is required">
                <input id="email" type="email" />
            </Field>,
        );

        const input = screen.getByLabelText('Email');

        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', 'email-error');
        expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
    });

    it('does not add error wiring when no error is present', () => {
        render(
            <Field id="name" label="Name">
                <input id="name" type="text" />
            </Field>,
        );

        const input = screen.getByLabelText('Name');

        expect(input).not.toHaveAttribute('aria-invalid');
        expect(input).not.toHaveAttribute('aria-describedby');
        expect(screen.queryByRole('alert')).toBeNull();
    });
});
