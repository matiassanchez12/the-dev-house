import * as React from 'react';
import { format, isValid, parse } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PhaseDatePickerProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const DATE_FORMAT = 'yyyy-MM-dd';

function parsePhaseDate(value: string): Date | undefined {
    if (value.trim() === '') {
        return undefined;
    }

    const parsedDate = parse(value, DATE_FORMAT, new Date());

    return isValid(parsedDate) ? parsedDate : undefined;
}

export function PhaseDatePicker({ id, value, onChange, disabled }: PhaseDatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const selectedDate = parsePhaseDate(value);
    const displayValue = selectedDate
        ? new Intl.DateTimeFormat('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(selectedDate)
        : 'Seleccionar fecha';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        className="w-full justify-between font-normal"
                        disabled={disabled}
                    />
                }
            >
                {displayValue}
                <CalendarDays data-icon="inline-end" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                        onChange(date ? format(date, DATE_FORMAT) : '');
                        setOpen(false);
                    }}
                />
                <div className="flex justify-end pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onChange('');
                            setOpen(false);
                        }}
                        disabled={!selectedDate}
                    >
                        Limpiar
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
