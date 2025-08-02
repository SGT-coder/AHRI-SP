
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { strategicPlanSchema, type StrategicPlanFormValues } from "@/lib/schemas";
import {
    goalOptions,
    objectiveOptions,
    executionTimeOptions,
    executingBodyOptions,
    departmentOptions,
    budgetSourceOptions,
    govBudgetCodeOptions,
} from "@/lib/options";
import type { Submission } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const defaultObjective = {
  objective: "",
  weight: "",
  strategicActions: [
    {
      action: "",
      weight: "",
      metrics: [{ metric: "", weight: "" }],
      mainTasks: [{ task: "", weight: "", target: "" }],
    },
  ],
};

const defaultFormValues: StrategicPlanFormValues = {
    userName: "",
    projectTitle: "",
    department: "",
    goal: "",
    objectives: [defaultObjective],
    executingBody: "",
    executionTime: "",
    budgetSource: "",
    governmentBudgetAmount: "",
    governmentBudgetCode: "",
    grantBudgetAmount: "",
    sdgBudgetAmount: "",
};

interface StrategicPlanFormProps {
    submission?: Submission | null;
    onSave: (data: StrategicPlanFormValues, id?: string) => void;
    isSubmitting: boolean;
    isReadOnly?: boolean;
}

export function StrategicPlanForm({ submission, onSave, isSubmitting, isReadOnly = false }: StrategicPlanFormProps) {
  
  const form = useForm<StrategicPlanFormValues>({
    resolver: zodResolver(strategicPlanSchema),
    defaultValues: submission ? submission : defaultFormValues,
  });

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control: form.control,
    name: "objectives",
  });

  useEffect(() => {
    form.reset(submission || defaultFormValues);
  }, [submission, form]);

  const budgetSource = form.watch("budgetSource");
  const formErrors = form.formState.errors.objectives?.root?.message;

  function onSubmit(data: StrategicPlanFormValues) {
    onSave(data, submission?.id);
  }
  
  const handleReset = () => {
    form.reset(defaultFormValues);
  }

  const isEditing = !!submission;
  const formTitle = isEditing ? "ዕቅድ አርትዕ" : "ስትራቴጂ ጉዳዮች ዕቅድ ማስገቢያ ቅጽ";
  const formDescription = isEditing
    ? "ለውጦችዎን ያስገቡ እና ለድጋሚ ግምገማ ያስገቡ።"
    : "ለግምገማ አዲስ ስልታዊ ዕቅድ ለማስገባት እባክዎ ከታች ያሉትን መስኮች ይሙሉ";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <fieldset disabled={isSubmitting || isReadOnly} className="space-y-6 group">

            {/* General Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center font-headline">{formTitle}</CardTitle>
                    <CardDescription className="text-center text-lg">{formDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 group-disabled:opacity-50">
                    <Card>
                        <CardHeader><CardTitle className="text-xl">1. አጠቃላይ መረጃ</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <FormField control={form.control} name="userName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>የአስገባው ሙሉ ስም</FormLabel>
                                    <FormControl><Input placeholder="ሙሉ ስምዎን ያስገቡ" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="projectTitle" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>የእቅድ ርዕስ</FormLabel>
                                    <FormControl><Input placeholder="የዕቅዱን ርዕስ ያስገቡ" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="department" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ዲፓርትመንት</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="ዲፓርትመንት ይምረጡ" /></SelectTrigger></FormControl>
                                        <SelectContent>{departmentOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="goal" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ግብ</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="ግብ ይምረጡ" /></SelectTrigger></FormControl>
                                        <SelectContent>{goalOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Dynamic Objectives Section */}
                    <Card>
                        <CardHeader><CardTitle className="text-xl">2. ዓላማዎች እና ስትራቴጂካዊ እርምጃዎች</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                           {objectiveFields.map((field, index) => (
                               <ObjectiveField
                                   key={field.id}
                                   control={form.control}
                                   objectiveIndex={index}
                                   removeObjective={removeObjective}
                                   isReadOnly={isReadOnly} />
                           ))}
                           {!isReadOnly && (
                                <Button type="button" variant="outline" onClick={() => appendObjective(defaultObjective)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> ዓላማ ጨምር
                                </Button>
                           )}
                           {form.formState.errors.objectives && (
                             <FormMessage>{form.formState.errors.objectives.message}</FormMessage>
                           )}
                        </CardContent>
                    </Card>

                    {/* Performance and Budget Card */}
                    <Card>
                        <CardHeader><CardTitle className="text-xl">2.2 አፈጻጸም እና በጀት</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="executingBody" render={({ field }) => (
                                    <FormItem><FormLabel>ፈጻሚ አካል</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="ፈጻሚ አካል ይምረጡ" /></SelectTrigger></FormControl>
                                            <SelectContent>{executingBodyOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="executionTime" render={({ field }) => (
                                    <FormItem><FormLabel>የሚከናወንበት ጊዜ</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="የሚከናወንበትን ጊዜ ይምረጡ" /></SelectTrigger></FormControl>
                                            <SelectContent>{executionTimeOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="budgetSource" render={({ field }) => (
                                    <FormItem><FormLabel>በጀት ምንጭ</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="የበጀት ምንጭ ይምረጡ" /></SelectTrigger></FormControl>
                                            <SelectContent>{budgetSourceOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage /></FormItem>
                                )} />
                            </div>
                            
                            {budgetSource && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                                    {budgetSource === 'መንግስት' && (<>
                                        <FormField control={form.control} name="governmentBudgetAmount" render={({ field }) => (<FormItem><FormLabel>ከመንግስት በጀት በብር</FormLabel><FormControl><Input type="number" placeholder="ብር" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="governmentBudgetCode" render={({ field }) => (<FormItem><FormLabel>ከመንግስት በጀት ኮድ</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="ኮድ ይምረጡ" /></SelectTrigger></FormControl><SelectContent>{govBudgetCodeOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    </>)}
                                    {budgetSource === 'ግራንት' && (<FormField control={form.control} name="grantBudgetAmount" render={({ field }) => (<FormItem className="md:col-span-1"><FormLabel>ከግራንት በጀት በብር</FormLabel><FormControl><Input type="number" placeholder="ብር" {...field} /></FormControl><FormMessage /></FormItem>)} />)}
                                    {budgetSource === 'ኢስዲጂ' && (<FormField control={form.control} name="sdgBudgetAmount" render={({ field }) => (<FormItem className="md:col-span-1"><FormLabel>ከኢስ ዲ ጂ በጀት በብር</FormLabel><FormControl><Input type="number" placeholder="ብር" {...field} /></FormControl><FormMessage /></FormItem>)} />)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </CardContent>

                {/* Footer and Submit */}
                <CardFooter className="flex flex-col items-stretch gap-4 p-6">
                    {formErrors && (
                        <Alert variant="destructive"><AlertDescription>{formErrors}</AlertDescription></Alert>
                    )}
                    <div className="flex justify-end gap-4">
                        {!submission && <Button type="button" variant="ghost" onClick={handleReset} disabled={isSubmitting || isReadOnly}>አጽዳ</Button>}
                        <Button type="submit" disabled={isSubmitting || isReadOnly} className="text-lg px-6 py-4">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (submission ? 'አርትዕ እና እንደገና አስገባ' : 'ዕቅድ አስገባ')}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
           </fieldset>
        </form>
      </Form>
    </div>
  );
}

// --- Sub-components for Field Arrays ---

const ObjectiveField = ({ control, objectiveIndex, removeObjective, isReadOnly }: { control: Control<StrategicPlanFormValues>, objectiveIndex: number, removeObjective: (index: number) => void, isReadOnly?: boolean }) => {
    const { fields: strategicActionFields, append, remove } = useFieldArray({
        control,
        name: `objectives.${objectiveIndex}.strategicActions`,
    });

    return (
        <div className="p-4 border rounded-lg space-y-4 relative bg-slate-50/50">
            {!isReadOnly && (
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeObjective(objectiveIndex)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                 <FormField control={control} name={`objectives.${objectiveIndex}.objective`} render={({ field }) => (
                    <FormItem><FormLabel>ዓላማ</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="ዓላማ ይምረጡ" /></SelectTrigger></FormControl>
                           <SelectContent>{objectiveOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                       </Select><FormMessage />
                    </FormItem>)} />
                 <FormField control={control} name={`objectives.${objectiveIndex}.weight`} render={({ field }) => (
                    <FormItem><FormLabel>የዓላማ ክብደት (%)</FormLabel><FormControl><Input type="number" placeholder="የዓላማ ክብደት ያስገቡ" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            <div className="pl-4 ml-2 space-y-4">
                 <h4 className="font-medium text-sm text-muted-foreground">2.1. ስትራቴጂክ እርምጃዎች</h4>
                {strategicActionFields.map((actionField, actionIndex) => (
                    <StrategicActionField key={actionField.id} control={control} objectiveIndex={objectiveIndex} actionIndex={actionIndex} remove={remove} isReadOnly={isReadOnly} />
                ))}
                {!isReadOnly && (
                    <Button type="button" size="sm" variant="outline" onClick={() => append({ action: "", weight: "", metrics: [{ metric: "", weight: ""}], mainTasks: [{task: "", weight: "", target: ""}] })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> ስትራቴጂክ እርምጃ ጨምር
                    </Button>
                )}
            </div>
        </div>
    );
}

const StrategicActionField = ({ control, objectiveIndex, actionIndex, remove, isReadOnly }: { control: Control<StrategicPlanFormValues>, objectiveIndex: number, actionIndex: number, remove: (index: number) => void, isReadOnly?: boolean }) => {
    return (
        <div className="p-4 border rounded-lg space-y-4 relative bg-white">
             {!isReadOnly && (
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(actionIndex)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormField control={control} name={`objectives.${objectiveIndex}.strategicActions.${actionIndex}.action`} render={({ field }) => (
                    <FormItem><FormLabel>እርምጃ</FormLabel><FormControl><Input placeholder="ስትራቴጂክ እርምጃ ያስገቡ" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name={`objectives.${objectiveIndex}.strategicActions.${actionIndex}.weight`} render={({ field }) => (
                    <FormItem><FormLabel>የእርምጃ ክብደት (%)</FormLabel><FormControl><Input type="number" placeholder="የእርምጃ ክብደት ያስገቡ" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            
            <Separator />
            
            <div className="pl-4 ml-2 space-y-4">
                <h5 className="font-medium text-sm text-muted-foreground">2.1.1 መለኪያዎች እና ተግባራት</h5>
                <MetricsField control={control} objectiveIndex={objectiveIndex} actionIndex={actionIndex} isReadOnly={isReadOnly} />
                <MainTasksField control={control} objectiveIndex={objectiveIndex} actionIndex={actionIndex} isReadOnly={isReadOnly} />
            </div>
             {control.getFieldState(`objectives.${objectiveIndex}.strategicActions.${actionIndex}.metrics`).error &&
                <FormMessage>{control.getFieldState(`objectives.${objectiveIndex}.strategicActions.${actionIndex}.metrics`).error?.root?.message}</FormMessage>
            }
        </div>
    )
}

const MetricsField = ({ control, objectiveIndex, actionIndex, isReadOnly }: { control: Control<StrategicPlanFormValues>, objectiveIndex: number, actionIndex: number, isReadOnly?: boolean }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `objectives.${objectiveIndex}.strategicActions.${actionIndex}.metrics`,
    });
    return (
        <div className="space-y-2">
            <h6 className="font-medium text-xs text-muted-foreground">መለኪያዎች</h6>
            {fields.map((field, metricIndex) => (
                 <div key={field.id} className="flex items-start gap-2">
                    <FormField control={control} name={`objectives.${objectiveIndex}.strategicActions.${actionIndex}.metrics.${metricIndex}.metric`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="መለኪያ ያስገቡ" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`objectives.${objectiveIndex}.strategicActions.${actionIndex}.metrics.${metricIndex}.weight`} render={({ field }) => (<FormItem className="w-48"><FormControl><Input type="number" placeholder="የመለኪያ ክብደት (%)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    {!isReadOnly && <Button type="button" variant="ghost" size="icon" onClick={() => remove(metricIndex)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
            ))}
            {!isReadOnly && <Button type="button" size="sm" variant="outline" onClick={() => append({ metric: "", weight: ""})}><PlusCircle className="mr-2 h-4 w-4" /> መለኪያ ጨምር</Button>}
        </div>
    )
}

const MainTasksField = ({ control, objectiveIndex, actionIndex, isReadOnly }: { control: Control<StrategicPlanFormValues>, objectiveIndex: number, actionIndex: number, isReadOnly?: boolean }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `objectives.${objectiveIndex}.strategicActions.${actionIndex}.mainTasks`,
    });
    return (
        <div className="space-y-2">
            <h6 className="font-medium text-xs text-muted-foreground">ዋና ተግባራት</h6>
            {fields.map((field, taskIndex) => (
                 <div key={field.id} className="p-2 border rounded-md space-y-2">
                    <div className="flex items-start gap-2">
                       <FormField control={control} name={`objectives.${objectiveIndex}.strategicActions.${actionIndex}.mainTasks.${taskIndex}.task`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="ዋና ተግባር ያስገቡ" {...field} /></FormControl><FormMessage /></FormItem>)} />
                       {!isReadOnly && <Button type="button" variant="ghost" size="icon" onClick={() => remove(taskIndex)}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                     <div className="flex items-start gap-2">
                       <FormField control={control} name={`objectives.${objectiveIndex}.strategicActions.${actionIndex}.mainTasks.${taskIndex}.weight`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="የተግባር ክብደት (%)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                       <FormField control={control} name={`objectives.${objectiveIndex}.strategicActions.${actionIndex}.mainTasks.${taskIndex}.target`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="የተግባር ዒላማ" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                 </div>
            ))}
            {!isReadOnly && <Button type="button" size="sm" variant="outline" onClick={() => append({ task: "", weight: "", target: ""})}><PlusCircle className="mr-2 h-4 w-4" /> ዋና ተግባር ጨምር</Button>}
        </div>
    )
}
