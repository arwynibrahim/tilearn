"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "mockPrisma", {
    enumerable: true,
    get: function() {
        return mockPrisma;
    }
});
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
    },
    domain: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn()
    },
    course: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
    },
    module: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn()
    },
    $connect: jest.fn(),
    $disconnect: jest.fn()
};

//# sourceMappingURL=prisma.service.js.map