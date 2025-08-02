
import * as z from "zod";

const weightSchema = z.string()
    .min(1, "ክብደት መግባት አለበት።")
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
        message: "ክብደት በ0 እና 100 መካከል ያለ ቁጥር መሆን አለበት።",
    });

const mainTaskSchema = z.object({
    task: z.string().min(1, "የተግባር መግለጫ ያስፈልጋል።"),
    weight: weightSchema,
    target: z.string().min(1, "ዒላማ ያስፈልጋል።"),
});

const metricSchema = z.object({
    metric: z.string().min(1, "የመለኪያ መግለጫ ያስፈልጋል።"),
    weight: weightSchema,
    mainTasks: z.array(mainTaskSchema).min(1, "ቢያንስ አንድ ዋና ተግባር ያስፈልጋል።"),
}).superRefine((data, ctx) => {
    const totalWeight = data.mainTasks.reduce((acc, t) => acc + (parseFloat(t.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `የዋና ተግባራት ክብደት ድምር 100% መሆን አለበት። የአሁኑ ድምር ${totalWeight.toFixed(2)}% ነው።`,
            path: [],
        });
    }
});

const strategicActionSchema = z.object({
    action: z.string().min(1, "የእርምጃ መግለጫ ያስፈልጋል።"),
    weight: weightSchema,
    metrics: z.array(metricSchema).min(1, "ቢያንስ አንድ መለኪያ ያስፈልጋል።"),
}).superRefine((data, ctx) => {
    const totalWeight = data.metrics.reduce((acc, m) => acc + (parseFloat(m.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `የመለኪያዎች ክብደት ድምር 100% መሆን አለበት። የአሁኑ ድምር ${totalWeight.toFixed(2)}% ነው።`,
            path: [],
        });
    }
});

const objectiveSchema = z.object({
    objective: z.string({ required_error: "ዓላማ መምረጥ ያስፈልጋል" }).min(1, "ዓላማ መምረጥ ያስፈልጋል"),
    objectiveWeight: weightSchema,
    strategicActions: z.array(strategicActionSchema).min(1, "ቢያንስ አንድ ስትራቴጂክ እርምጃ ያስፈልጋል።"),
    executingBody: z.string({ required_error: "ፈጻሚ አካል መምረጥ ያስፈልጋል" }).min(1, "ፈጻሚ አካል መምረጥ ያስፈልጋል"),
    executionTime: z.string({ required_error: "የሚከናወንበት ጊዜ መምረጥ ያስፈልጋል" }).min(1, "የሚከናወንበት ጊዜ መምረጥ ያስፈልጋል"),
    budgetSource: z.string({ required_error: "የበጀት ምንጭ መምረጥ ያስፈልጋል" }).min(1, "የበጀት ምንጭ መምረጥ ያስፈልጋል"),
    governmentBudgetAmount: z.string().optional(),
    governmentBudgetCode: z.string().optional(),
    grantBudgetAmount: z.string().optional(),
    sdgBudgetAmount: z.string().optional(),
}).superRefine((data, ctx) => {
    const totalWeight = data.strategicActions.reduce((acc, sa) => acc + (parseFloat(sa.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `የስትራቴጂክ እርምጃዎች ክብደት ድምር 100% መሆን አለበት። የአሁኑ ድምር ${totalWeight.toFixed(2)}% ነው።`,
            path: ['strategicActions'],
        });
    }
     if (data.budgetSource === 'መንግስት') {
        if (!data.governmentBudgetAmount || data.governmentBudgetAmount.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ከመንግስት በጀት መጠን መግባት አለበት።", path: ['governmentBudgetAmount'] });
        }
        if (!data.governmentBudgetCode || data.governmentBudgetCode.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ከመንግስት በጀት ኮድ መመረጥ አለበት።", path: ['governmentBudgetCode'] });
        }
    }
    if (data.budgetSource === 'ግራንት') {
        if (!data.grantBudgetAmount || data.grantBudgetAmount.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ከግራንት በጀት መጠን መግባት አለበት።", path: ['grantBudgetAmount'] });
        }
    }
    if (data.budgetSource === 'ኢስዲጂ') {
        if (!data.sdgBudgetAmount || data.sdgBudgetAmount.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ከኢስ ዲ ጂ በጀት መጠን መግባት አለበት።", path: ['sdgBudgetAmount'] });
        }
    }
});


export const strategicPlanSchema = z.object({
    userName: z.string({ required_error: "ስም ያስፈልጋል" }).min(1, "ስም ያስፈልጋል"),
    projectTitle: z.string({ required_error: "የእቅድ ርዕስ ያስፈልጋል" }).min(1, "የእቅድ ርዕስ ያስፈልጋል"),
    department: z.string({ required_error: "ዲፓርትመንት መምረጥ ያስፈልጋል" }).min(1, "ዲፓርትመንት መምረጥ ያስፈልጋል"),
    goal: z.string({ required_error: "ግብ መምረጥ ያስፈልጋል" }).min(1, "ግብ መምረጥ ያስፈልጋል"),
    
    objectives: z.array(objectiveSchema).min(1, "ቢያንስ አንድ ዓላማ ያስፈልጋል።"),

}).superRefine((data, ctx) => {
    const totalObjectiveWeight = data.objectives.reduce((acc, obj) => acc + (parseFloat(obj.objectiveWeight) || 0), 0);
    if (Math.abs(totalObjectiveWeight - 100) > 0.01) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `የሁሉም ዓላማ ክብደቶች ድምር 100% መሆን አለበት። የአሁኑ ድምር ${totalObjectiveWeight.toFixed(2)}% ነው።`,
            path: ['objectives'],
        });
    }
});


export type StrategicPlanFormValues = z.infer<typeof strategicPlanSchema>;

export const resetPasswordSchema = z.object({
    fullName: z.string().min(1, 'ሙሉ ስም ያስፈልጋል።'),
    email: z.string().email('የተሳሳተ የኢሜይል አድራሻ።'),
});

// --- User Settings Schemas ---
export const updateProfileSchema = z.object({
    name: z.string().min(2, "ስም ቢያንስ 2 ቁምፊዎች መሆን አለበት።"),
    email: z.string().email("የተሳሳተ የኢሜይል አድራሻ።"),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "የድሮ የይለፍ ቃል ያስፈልጋል።"),
    newPassword: z.string().min(6, "አዲስ የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።"),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "አዲስ የይለፍ ቃሎች አይዛመዱም።",
    path: ["confirmPassword"],
});
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const adminAddUserSchema = z.object({
    name: z.string().min(2, "ስም ቢያንስ 2 ቁምፊዎች መሆን አለበት።"),
    email: z.string().email("የተሳሳተ የኢሜይል አድራሻ።"),
    password: z.string().min(6, "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።"),
    confirmPassword: z.string(),
    role: z.enum(['Admin', 'Approver'], { required_error: "ሚና መምረጥ ያስፈልጋል።" }),
}).refine(data => data.password === data.confirmPassword, {
    message: "የይለፍ ቃሎች አይዛመዱም።",
    path: ["confirmPassword"],
});
export type AdminAddUserFormValues = z.infer<typeof adminAddUserSchema>;
