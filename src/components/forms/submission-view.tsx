
"use client";

import * as React from 'react';
import type { Submission, SubmissionStatus } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareWarning, CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateDisplay } from "@/components/shared/date-display";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SubmissionViewProps {
  submission: Submission;
  onUpdateStatus?: (id: string, status: SubmissionStatus, comments?: string) => void;
}

const RejectionDialog = ({ onConfirm }: { onConfirm: (comment: string) => void }) => {
    const [comment, setComment] = React.useState("");
    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>ማመልከቻው ውድቅ ይደረግ?</AlertDialogTitle>
                <AlertDialogDescription>
                    እባክዎ ይህን ማመልከቻ ውድቅ ለማድረግ ምክንያት ያቅርቡ። ይህ ለተጠቃሚው የሚታይ ይሆናል።
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea 
                placeholder="አስተያየትዎን እዚህ ይጻፉ..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setComment('')}>ይቅር</AlertDialogCancel>
                <AlertDialogAction onClick={() => onConfirm(comment)}>ውድቅ ማድረጉን አረጋግጥ</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    )
}

const DescriptionListItem = ({ term, children, isMono=false, className="" }: { term: string, children: React.ReactNode, isMono?: boolean, className?: string }) => (
    !children || children === '' ? null :
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-1 py-3", className)}>
      <dt className="font-medium text-muted-foreground">{term}</dt>
      <dd className={`md:col-span-2 ${isMono ? 'font-mono text-sm' : ''}`}>{children}</dd>
    </div>
);

export function SubmissionView({ submission, onUpdateStatus }: SubmissionViewProps) {
  const totalBudget = [
    submission.governmentBudgetAmount,
    submission.grantBudgetAmount,
    submission.sdgBudgetAmount
  ].reduce((acc, amount) => acc + (Number(amount) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* General Info */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-3xl">{submission.projectTitle}</CardTitle>
              <CardDescription>ያስገባው: {submission.userName}</CardDescription>
            </div>
            <StatusBadge status={submission.status} className="text-base px-4 py-2" />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <DescriptionListItem term="ID" isMono>{submission.id}</DescriptionListItem>
            <DescriptionListItem term="ዲፓርትመንት">{submission.department}</DescriptionListItem>
            <DescriptionListItem term="ግብ">{submission.goal}</DescriptionListItem>
            <DescriptionListItem term="የገባበት ቀን"><DateDisplay dateString={submission.submittedAt} includeTime /></DescriptionListItem>
            <DescriptionListItem term="ለመጨረሻ ጊዜ የተሻሻለው"><DateDisplay dateString={submission.lastModifiedAt} includeTime /></DescriptionListItem>
          </dl>
        </CardContent>
      </Card>
      
      {/* Objectives Details */}
      <Card>
        <CardHeader><CardTitle className="font-headline">ዝርዝር ዕቅድ</CardTitle></CardHeader>
        <CardContent className="space-y-6">
            {submission.objectives?.map((obj, index) => (
                <div key={index} className="p-4 border rounded-lg bg-slate-50/50">
                    <div className="flex justify-between items-baseline mb-4">
                        <h3 className="font-headline text-xl text-primary">{obj.objective}</h3>
                        <p className="text-lg font-semibold">የዓላማ ክብደት: <span className="font-mono text-primary">{obj.objectiveWeight}%</span></p>
                    </div>

                    {obj.strategicActions?.map((action, actionIndex) => (
                      <div key={actionIndex} className="mt-4">
                        <h4 className="font-semibold text-lg border-b pb-2 mb-2">{action.action} <span className="text-base font-mono text-muted-foreground">(የእርምጃ ክብደት: {action.weight}%)</span></h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h5 className="font-medium mb-2">መለኪያዎች</h5>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>መለኪያ</TableHead>
                                            <TableHead className="text-right">ክብደት</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {action.metrics.map((metric, metricIndex) => (
                                            <TableRow key={metricIndex}>
                                                <TableCell>{metric.metric}</TableCell>
                                                <TableCell className="text-right font-mono">{metric.weight}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div>
                                <h5 className="font-medium mb-2">ዋና ተግባራት</h5>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ተግባር</TableHead>
                                            <TableHead>ዒላማ</TableHead>
                                            <TableHead className="text-right">ክብደት</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {action.mainTasks.map((task, taskIndex) => (
                                            <TableRow key={taskIndex}>
                                                <TableCell>{task.task}</TableCell>
                                                <TableCell>{task.target}</TableCell>
                                                <TableCell className="text-right font-mono">{task.weight}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                      </div>
                    ))}
                </div>
            ))}
        </CardContent>
      </Card>

      {/* Performance & Budget */}
        <Card>
            <CardHeader><CardTitle className="font-headline">አፈጻጸም እና በጀት</CardTitle></CardHeader>
            <CardContent>
                <dl className="divide-y">
                    <DescriptionListItem term="ፈጻሚ አካል">{submission.executingBody}</DescriptionListItem>
                    <DescriptionListItem term="የሚከናወንበት ጊዜ">{submission.executionTime}</DescriptionListItem>
                    <DescriptionListItem term="በጀት ምንጭ">{submission.budgetSource}</DescriptionListItem>
                    <DescriptionListItem term="ከመንግስት በጀት በብር">{submission.governmentBudgetAmount}</DescriptionListItem>
                    <DescriptionListItem term="ከመንግስት በጀት ኮድ">{submission.governmentBudgetCode}</DescriptionListItem>
                    <DescriptionListItem term="ከግራንት በጀት በብር">{submission.grantBudgetAmount}</DescriptionListItem>
                    <DescriptionListItem term="ከኢስ ዲ ጂ በጀት በብር">{submission.sdgBudgetAmount}</DescriptionListItem>
                </dl>
            </CardContent>
            <CardFooter className="text-right">
                <p className="w-full text-xl font-bold">ጠቅላላ በጀት: <span className="text-primary">{totalBudget.toLocaleString()} ብር</span></p>
            </CardFooter>
        </Card>

      {/* Action Buttons */}
      {submission.status === 'Pending' && onUpdateStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">ድርጊቶች</CardTitle>
            <CardDescription>ይህንን ማመልከቻ አጽድቅ ወይም ውድቅ አድርግ።</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => onUpdateStatus(submission.id, "Approved")} className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" /> አጽድቅ
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <XCircle className="mr-2 h-4 w-4" /> ውድቅ አድርግ
                </Button>
              </AlertDialogTrigger>
              <RejectionDialog onConfirm={(comment) => onUpdateStatus(submission.id, "Rejected", comment)} />
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      {submission.comments && (
        <Card className="bg-amber-50 border-amber-200">
           <CardHeader className="flex flex-row items-center gap-4">
            <MessageSquareWarning className="h-8 w-8 text-amber-600" />
            <div>
                <CardTitle className="font-headline text-amber-900">የአጽዳቂው አስተያየት</CardTitle>
                <CardDescription className="text-amber-700">ከገምጋሚው የተሰጠ አስተያየት።</CardDescription>
            </div>
           </CardHeader>
           <CardContent>
              <p className="text-amber-800">{submission.comments}</p>
           </CardContent>
        </Card>
      )}

    </div>
  );
}
