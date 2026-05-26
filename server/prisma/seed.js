import { PrismaClient, Priority } from '@prisma/client';
const prisma = new PrismaClient();
const tagPalette = [
    ['Setup', '#6366F1'],
    ['Design', '#A855F7'],
    ['Feature', '#22C55E'],
    ['Backend', '#06B6D4'],
    ['QA', '#F97316'],
    ['Docs', '#EC4899'],
];
async function main() {
    await prisma.auditLog.deleteMany();
    await prisma.cardTag.deleteMany();
    await prisma.card.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
    const demoUser = await prisma.user.create({
        data: { name: 'Demo User', email: 'demo.user@kanban.local' },
    });
    const board = await prisma.board.create({
        data: {
            title: 'My Kanban Board',
            order: 0,
            columns: {
                create: [
                    { title: 'To Do', order: 0 },
                    { title: 'In Progress', order: 1 },
                    { title: 'Done', order: 2 },
                ],
            },
        },
        include: { columns: true },
    });
    const tags = await Promise.all(tagPalette.map(([label, color]) => prisma.tag.create({ data: { boardId: board.id, label, color } })));
    const columns = board.columns.sort((a, b) => a.order - b.order);
    const priorities = [Priority.HIGH, Priority.MEDIUM, Priority.LOW];
    const titles = [
        'Set up project repository',
        'Design system tokens',
        'Build Kanban board UI',
        'Define data models',
        'Add GraphQL schema',
        'Implement lazy loading',
        'Test optimistic updates',
        'Document deployment tradeoffs',
    ];
    for (let index = 0; index < 520; index += 1) {
        const column = columns[index % columns.length];
        const priority = priorities[index % priorities.length];
        const tag = tags[index % tags.length];
        await prisma.card.create({
            data: {
                boardId: board.id,
                columnId: column.id,
                assigneeId: index % 3 === 0 ? demoUser.id : null,
                title: `${titles[index % titles.length]} #${index + 1}`,
                description: `Seeded card ${index + 1} for pagination and lazy loading checks.`,
                priority,
                dueDate: index % 5 === 0 ? new Date(Date.now() + index * 86400000) : null,
                order: Math.floor(index / columns.length),
                tags: { create: [{ tagId: tag.id }] },
            },
        });
    }
    console.log(`Seeded board ${board.id} with ${columns.length} columns and 520 cards.`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
