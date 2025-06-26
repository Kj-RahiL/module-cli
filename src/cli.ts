#!/usr/bin/env node

import fs from "fs";
import path from "path";

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("❌ Please provide a module name!");
  process.exit(1);
}

const currentDir = process.cwd();
const moduleDir = path.join(currentDir, "src", "app", "modules", moduleName);

if (fs.existsSync(moduleDir)) {
  console.error(`❌ Module "${moduleName}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(moduleDir, { recursive: true });

const files = {
  [`${moduleName}.validation.ts`]: `import { z } from "zod";

export const ${moduleName}Schema = z.object({
    body: z.object({
        name: z.string(),
        email: z.string().email(),
    }),
});
`,
  [`${moduleName}.interface.ts`]: `export type T${moduleName} = {
    id: string;
    name: string;
    email: string;
}`,
  [`${moduleName}.service.ts`]: `import prisma from "../../../shared/prisma";
import QueryBuilder from "../../../helpars/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

const create${moduleName} = async (data: any) => {

//if you wanna add logic here
    const result = await prisma.${moduleName.toLowerCase()}.create({ data });
    return result;
};

const getAll${moduleName}s = async (query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(prisma.${moduleName.toLowerCase()}, query);
    const ${moduleName.toLowerCase()}s = await queryBuilder
        .search([""])
        .filter()
        .sort()
        .paginate()
        .fields()
        .execute()

    const meta = await queryBuilder.countTotal();
    return { meta, data: ${moduleName.toLowerCase()}s };
};

const getSingle${moduleName} = async (id: string) => {
    const result = await prisma.${moduleName.toLowerCase()}.findUnique({ where: { id } });
    if(!result){
     throw new ApiError(httpStatus.NOT_FOUND, "${moduleName} not found..!!")
    }
    return result;
};

const update${moduleName} = async (id: string, data: any) => {
    const existing${moduleName} = await prisma.${moduleName.toLowerCase()}.findUnique({ where: { id } });
    if (!existing${moduleName}) {
        throw new ApiError(httpStatus.NOT_FOUND, "${moduleName} not found..!!");
    }
    const result = await prisma.${moduleName.toLowerCase()}.update({ where: { id }, data });
    return result;
};

const delete${moduleName} = async (id: string) => {
 const existing${moduleName} = await prisma.${moduleName.toLowerCase()}.findUnique({ where: { id } });
    if (!existing${moduleName}) {
        throw new ApiError(httpStatus.NOT_FOUND, "${moduleName} not found..!!");
    }
    const result = await prisma.${moduleName.toLowerCase()}.delete({ where: { id } });
    return null;
};

export const ${moduleName.toLowerCase()}Service = {
    create${moduleName},
    getAll${moduleName}s,
    getSingle${moduleName},
    update${moduleName},
    delete${moduleName},
};
`,
  [`${moduleName}.controller.ts`]: `import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { ${moduleName.toLowerCase()}Service } from "./${moduleName}.service";

const create${moduleName} = catchAsync(async (req: Request, res: Response) => {
    const result = await ${moduleName.toLowerCase()}Service.create${moduleName}(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "${moduleName} created successfully",
        data: result,
    });
});

const getAll${moduleName}s = catchAsync(async (req: Request, res: Response) => {
    const results = await ${moduleName.toLowerCase()}Service.getAll${moduleName}s(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "${moduleName}s retrieved successfully",
        meta:results.meta,
        data: results.data,
    });
});

const getSingle${moduleName} = catchAsync(async (req: Request, res: Response) => {
    const result = await ${moduleName.toLowerCase()}Service.getSingle${moduleName}(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "${moduleName} retrieved successfully",
        data: result,
    });
});

const update${moduleName} = catchAsync(async (req: Request, res: Response) => {
    const result = await ${moduleName.toLowerCase()}Service.update${moduleName}(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "${moduleName} updated successfully",
        data: result,
    });
});

const delete${moduleName} = catchAsync(async (req: Request, res: Response) => {
    const result = await ${moduleName.toLowerCase()}Service.delete${moduleName}(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "${moduleName} deleted successfully",
        data: result,
    });
});

export const ${moduleName.toLowerCase()}Controller = {
    create${moduleName},
    getAll${moduleName}s,
    getSingle${moduleName},
    update${moduleName},
    delete${moduleName},
};
`,
  [`${moduleName}.route.ts`]: `import { Router } from "express";
import { ${moduleName.toLowerCase()}Controller } from "./${moduleName}.controller";

const router = Router();

// create ${moduleName.toLowerCase()}
router.post("/create", ${moduleName.toLowerCase()}Controller.create${moduleName});

// get all ${moduleName.toLowerCase()}
router.get("/", ${moduleName.toLowerCase()}Controller.getAll${moduleName}s);

// get single ${moduleName.toLowerCase()} by id
router.get("/:id", ${moduleName.toLowerCase()}Controller.getSingle${moduleName});

// update ${moduleName.toLowerCase()}
router.put("/:id", ${moduleName.toLowerCase()}Controller.update${moduleName});

// delete ${moduleName.toLowerCase()}
router.delete("/:id", ${moduleName.toLowerCase()}Controller.delete${moduleName});

export const ${moduleName.toLowerCase()}Routes = router;
`,
};

for (const [fileName, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(moduleDir, fileName), content);
}

console.log(
  `✅ Module "${moduleName}" created successfully in src/modules/${moduleName}`
);
