Integration tests in this folder exercise the service layer against a real
PostgreSQL database (they are not mocked, per the "no fake API
implementations" requirement). They need `DATABASE_URL` to point at a
disposable test database — never point this at production data, since
these tests insert and delete rows.

Setup:

    createdb portfolio_test
    DATABASE_URL=postgresql://postgres:password@localhost:5432/portfolio_test npm run db:migrate
    DATABASE_URL=postgresql://postgres:password@localhost:5432/portfolio_test npm test

If `DATABASE_URL` is not set when the suite runs, these tests are skipped
(see the `describe.skipIf` guards) rather than failing, so `npm test` still
works out of the box for the pure-unit suite in tests/unit.
