-- Optional: Create a trigger to automatically update paid fees after installment_amt changes
CREATE OR REPLACE FUNCTION trigger_update_paid_fees()
RETURNS TRIGGER AS $$
BEGIN
    NEW.paid_fees = (
        SELECT COALESCE(SUM(amount), 0)
        FROM unnest(NEW.installment_amt) AS amount
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_paid_fees_trigger
BEFORE INSERT OR UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION trigger_update_paid_fees();
