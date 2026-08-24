"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export function CatalogInteractive() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("pothole");

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-2">
        <Input label="Ward name" placeholder="e.g. Ward 12" hint="Visible to administrators only." />
        <Select
          label="Issue category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={[
            { value: "pothole", label: "Pothole" },
            { value: "light", label: "Street light" },
            { value: "garbage", label: "Garbage" },
          ]}
        />
        <div className="md:col-span-2">
          <Textarea
            label="Description"
            hint="Plain language helps field staff."
            defaultValue="Broken cover on the storm drain near the bus stand."
          />
        </div>
        <Input label="Email" error="Enter a valid email address." defaultValue="citizen" />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Button variant="secondary" onClick={() => toast("Status updated.", "success")}>
          Show toast
        </Button>
        <Button variant="ghost" onClick={() => toast("Saved as draft.", "info")}>
          Info toast
        </Button>
        <Button variant="danger" onClick={() => toast("Could not submit.", "error")}>
          Error toast
        </Button>
      </div>

      <Modal
        open={open}
        title="Confirm assignment"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Assign department</Button>
          </>
        }
      >
        <p className="text-body">
          This dialog uses the native HTML dialog element so Escape, focus, and
          backdrop click work without extra libraries.
        </p>
      </Modal>
    </div>
  );
}
