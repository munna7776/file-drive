"use client";

import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, "Required"),
});

export default function Home() {
  const { organization, isLoaded: isOrgainzationLoaded } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });
  const [isFilesUploadOpen, setIsFilesUploadOpen] = useState(false);
  const { toast } = useToast();

  const fileRef = form.register("file");

  let orgOrUserId: string | undefined = undefined;
  let orgOrUserName: string | undefined | null = undefined;
  if (isUserLoaded && isOrgainzationLoaded) {
    orgOrUserId = organization?.id ?? user?.id;
    orgOrUserName = organization?.name ?? user?.fullName;
  }

  const createFile = useMutation(api.files.createFile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const files = useQuery(
    api.files.getFiles,
    orgOrUserId ? { orgId: orgOrUserId } : "skip",
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgOrUserId) {
      return;
    }

    try {
      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl();
      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": values.file[0].type },
        body: values.file[0],
      });
      const { storageId } = await result.json();
      await createFile({
        name: `Hello Munna, welcome to file drive project by ${orgOrUserName}`,
        orgId: orgOrUserId,
        fileId: storageId,
      });
      setIsFilesUploadOpen(false);
      toast({
        variant: "success",
        title: "Successfully uploaded file",
        description: "Now you can view your file.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: "Your file couldn't be uploaded, try again later.",
      });
    }
  }

  return (
    <main className="container p-12">
      <div className="flex justify-between items-center ">
        <h1 className="text-4xl font-bold">Your Files</h1>
        <Dialog
          open={isFilesUploadOpen}
          onOpenChange={(isOpen) => {
            setIsFilesUploadOpen(isOpen);
            form.reset();
          }}
        >
          <DialogTrigger asChild>
            <Button>Upload File</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="mb-4">
              <DialogTitle>Upload your files here</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="title of your file" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input type="file" {...fileRef} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    aria-disabled={form.formState.isSubmitting}
                    className="gap-1"
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </form>
              </Form>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
      {files?.map((file) => (
        <div key={file._id}>{file.name}</div>
      ))}
    </main>
  );
}
