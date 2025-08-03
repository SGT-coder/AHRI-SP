
"use client";

import * as React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Minus, Equal, Percent, BrainCircuit, Trash2, Divide, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StrategicPlanFormValues } from "@/lib/schemas";


type WeightBalancerMode = "objectives" | "strategicActions" | "metricsAndTasks";

const WeightBalancer = ({ 
    title,
    description,
    form,
    mode,
}: { 
    title: string,
    description: string,
    form: UseFormReturn<StrategicPlanFormValues>,
    mode: WeightBalancerMode,
}) => {
    const objectives = form.watch("objectives");
    
    let totalWeight = 0;
    let itemsToUpdate: {path: string, value: number}[] = [];

    if (mode === "objectives") {
        totalWeight = objectives.reduce((acc, obj) => acc + (parseFloat(obj.objectiveWeight) || 0), 0);
        objectives.forEach((obj, index) => {
            const value = parseFloat(obj.objectiveWeight) || 0;
            if (value > 0) {
                 itemsToUpdate.push({ path: `objectives.${index}.objectiveWeight`, value });
            }
        });
    } else if (mode === "strategicActions") {
        totalWeight = objectives.reduce((acc, obj) => 
            acc + obj.strategicActions.reduce((actAcc, action) => actAcc + (parseFloat(action.weight) || 0), 0)
        , 0);

        objectives.forEach((obj, objIndex) => {
            obj.strategicActions.forEach((action, actIndex) => {
                const value = parseFloat(action.weight) || 0;
                if (value > 0) {
                    itemsToUpdate.push({ path: `objectives.${objIndex}.strategicActions.${actIndex}.weight`, value });
                }
            });
        });
    } else if (mode === "metricsAndTasks") {
         objectives.forEach((obj, objIndex) => {
            obj.strategicActions.forEach((action, actIndex) => {
                action.metrics.forEach((metric, metricIndex) => {
                    const metricValue = parseFloat(metric.weight) || 0;
                    if(metricValue > 0) {
                        itemsToUpdate.push({ path: `objectives.${objIndex}.strategicActions.${actIndex}.metrics.${metricIndex}.weight`, value: metricValue });
                        totalWeight += metricValue;
                    }
                    metric.mainTasks.forEach((task, taskIndex) => {
                         const taskValue = parseFloat(task.weight) || 0;
                         if(taskValue > 0) {
                             itemsToUpdate.push({ path: `objectives.${objIndex}.strategicActions.${actIndex}.metrics.${metricIndex}.mainTasks.${taskIndex}.weight`, value: taskValue });
                             totalWeight += taskValue;
                         }
                    })
                });
            });
        });
    }
    
    const handleNormalize = () => {
        if (totalWeight === 0) return;
        
        itemsToUpdate.forEach(item => {
            const normalizedValue = (item.value / totalWeight) * 100;
            form.setValue(item.path as any, normalizedValue.toFixed(2), { shouldValidate: true });
        });
    };
    
    const needsBalancing = Math.abs(totalWeight - 100) > 0.01;

    return (
         <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <p className="text-4xl font-bold font-mono" style={{color: needsBalancing ? "hsl(var(--destructive))" : "hsl(var(--primary))"}}>
                    {totalWeight.toFixed(2)}%
                </p>
                <p className="text-muted-foreground">የአሁኑ ጠቅላላ ክብደት</p>
                 <Button onClick={handleNormalize} disabled={totalWeight === 0 || !needsBalancing}>
                    <Percent className="mr-2 h-4 w-4" /> ክብደቶችን ወደ 100% አስተካክል
                </Button>
            </CardContent>
            <CardFooter>
                 {!needsBalancing && <p className="text-sm text-green-600 w-full text-center">ክብደቶች በትክክል ወደ 100% ተስተካክለዋል።</p>}
            </CardFooter>
        </Card>
    )
}

const SimpleCalculator = () => {
    const [input, setInput] = React.useState("");
    const [result, setResult] = React.useState<string>("");

    const handleInput = (value: string) => {
        if (result !== "" && !["+", "-", "*", "/"].includes(value)) {
           setInput(value);
           setResult("");
        } else if (result !== "" && ["+", "-", "*", "/"].includes(value)) {
            setInput(result + value);
            setResult("");
        } else {
            setInput(input + value);
        }
    };

    const handleClear = () => {
        setInput("");
        setResult("");
    };

    const handleCalculate = () => {
        try {
            // Avoid using eval(). A safer approach is to parse and calculate.
            // This simple implementation handles chained operations but not operator precedence.
            let evalResult = new Function('return ' + input.replace(/[^-()\\d/*+.]/g, ''))();
            setResult(String(evalResult));
        } catch (e) {
            setResult("Error");
        }
    };
    
    const renderButton = (value: string, handler: (val: string) => void, className: string = "") => (
        <Button variant="outline" className={`text-xl font-bold h-14 ${className}`} onClick={() => handler(value)}>
            {value}
        </Button>
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>ቀላል ማስያ</CardTitle>
                <CardDescription>ለፈጣን ስሌቶች ይጠቀሙ።</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="p-4 bg-muted rounded-md text-right h-16 flex items-center justify-end">
                    <p className="text-3xl font-mono text-foreground truncate">
                       {result || input || "0"}
                    </p>
                 </div>
                <div className="grid grid-cols-4 gap-2">
                    {renderButton("C", () => handleClear(), "col-span-2 bg-destructive/20 text-destructive")}
                    {renderButton("/", handleInput)}
                    {renderButton("*", handleInput)}

                    {renderButton("7", handleInput)}
                    {renderButton("8", handleInput)}
                    {renderButton("9", handleInput)}
                    {renderButton("-", handleInput)}
                    
                    {renderButton("4", handleInput)}
                    {renderButton("5", handleInput)}
                    {renderButton("6", handleInput)}
                    {renderButton("+", handleInput)}

                    <div className="grid grid-rows-2 grid-cols-3 col-span-3 gap-2">
                        {renderButton("1", handleInput, "col-start-1")}
                        {renderButton("2", handleInput)}
                        {renderButton("3", handleInput)}
                        {renderButton("0", handleInput, "col-span-2")}
                        {renderButton(".", handleInput)}
                    </div>
                    {renderButton("=", () => handleCalculate(), "row-span-2 h-full bg-primary/20 text-primary")}
                </div>
            </CardContent>
        </Card>
    )
}


export function CreativeCalculator({ isOpen, onOpenChange, form }: { isOpen: boolean, onOpenChange: (open: boolean) => void, form: UseFormReturn<StrategicPlanFormValues>}) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <div>
              <DialogTitle className="text-2xl font-headline">የፈጠራ ማስያ</DialogTitle>
              <DialogDescription>
                በጀትዎን እና ክብደትዎን ለማስተዳደር የሚረዱ መሳሪያዎች።
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="objectives">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="objectives">የዓላማ ክብደት</TabsTrigger>
              <TabsTrigger value="actions">የእርምጃ ክብደት</TabsTrigger>
              <TabsTrigger value="metrics">መለኪያ/ተግባር ክብደት</TabsTrigger>
              <TabsTrigger value="simple-calc">ቀላል ማስያ</TabsTrigger>
            </TabsList>
            <TabsContent value="objectives" className="pt-4">
                <WeightBalancer
                    title="የዓላማ ክብደት ማመጣጠኛ"
                    description="የሁሉም ዓላማዎችዎ ጠቅላላ ክብደት 100% መሆኑን ያረጋግጡ።"
                    form={form}
                    mode="objectives"
                />
            </TabsContent>
            <TabsContent value="actions" className="pt-4">
                <WeightBalancer
                    title="የስትራቴጂክ እርምጃ ክብደት ማመጣጠኛ"
                    description="የሁሉም ስትራቴጂክ እርምጃዎችዎ ጠቅላላ ክብደት 100% መሆኑን ያረጋግጡ።"
                    form={form}
                    mode="strategicActions"
                />
            </TabsContent>
            <TabsContent value="metrics" className="pt-4">
                <WeightBalancer
                    title="የመለኪያ እና የተግባር ክብደት ማመጣጠኛ"
                    description="የሁሉም መለኪያዎች እና ዋና ተግባራትዎ ጠቅላላ ክብደት 100% መሆኑን ያረጋግጡ።"
                    form={form}
                    mode="metricsAndTasks"
                />
            </TabsContent>
            <TabsContent value="simple-calc" className="pt-4">
                <SimpleCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
