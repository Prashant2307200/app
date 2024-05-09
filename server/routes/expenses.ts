import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod';

/*
type Expense = {
    id: number,
    title: string,
    amount: number
};
*/

const expenseSchema = z.object({
    id: z.number().int().positive().min(1),
    title: z.string().min(3).max(100),
    amount: z.number().int().positive()
});

type Expense = z.infer<typeof expenseSchema>;

const createPostSchema = z.object({
    title: z.string().min(3).max(100),
    amount: z.number().int().positive()
});

const fakeExpenses: Expense[] = [
    { id: 0, title: "Groceries", amount: 50 },
    { id: 1, title: "Utilities", amount: 100 },
    { id: 2, title: "Rent", amount: 100 }
];

const expensesRoute = new Hono()

expensesRoute
.get("/", c => c.json({ expenses: fakeExpenses }))
.post("/", zValidator("json",createPostSchema), async c => {
    // const expense: Expense = await c.req.json();
    // console.log({ expense });
    const data = await c.req.valid("json");
    const expense = createPostSchema.parse(data);
    fakeExpenses.push({ ...expense, id: fakeExpenses.length });
    c.status(201);
    return c.json(expense);
})
.get("/:id{[0-9]+}", c => {
    const id = +c.req.param("id");
    const expense = fakeExpenses.find(expense => expense.id === id);
    if(!expense){
        return c.notFound();
    }
    return c.json({ expense });
})
.delete("/:id{[0-9]+}", c => {
    const id = +c.req.param("id");
    const idx = fakeExpenses.findIndex(expense => expense.id === id);
    if(idx === -1){
        return c.notFound();
    }
    const deletedExpense = fakeExpenses.splice(idx,1)[0];
    return c.json({ expense: deletedExpense });
});

export default expensesRoute;