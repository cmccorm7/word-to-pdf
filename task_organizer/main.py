import customtkinter
from dataclasses import dataclass, field, asdict
from typing import Optional, List
import json
import os

DATA_FILE = "tasks.json"

@dataclass
class Task:
    title: str
    due_date: str = ""
    urgency: int = 0 # 0: low, 1: medium, 2: high
    steps: List[str] = field(default_factory=list)

class TaskEditDialog(customtkinter.CTkToplevel):
    def __init__(self, master, task: Task):
        super().__init__(master)
        self.task = task

        self.title("Edit Task")
        self.geometry("500x400")

        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(2, weight=1) # Make the steps frame expandable

        # --- Basic Info ---
        self.due_date_label = customtkinter.CTkLabel(self, text="Due Date:")
        self.due_date_label.grid(row=0, column=0, padx=10, pady=10, sticky="w")
        self.due_date_entry = customtkinter.CTkEntry(self)
        self.due_date_entry.grid(row=0, column=1, padx=10, pady=10, sticky="ew")
        self.due_date_entry.insert(0, self.task.due_date)

        self.urgency_label = customtkinter.CTkLabel(self, text="Urgency:")
        self.urgency_label.grid(row=1, column=0, padx=10, pady=10, sticky="w")
        self.urgency_slider = customtkinter.CTkSlider(self, from_=0, to=2, number_of_steps=2)
        self.urgency_slider.grid(row=1, column=1, padx=10, pady=10, sticky="ew")
        self.urgency_slider.set(self.task.urgency)

        # --- Steps ---
        self.steps_frame = customtkinter.CTkFrame(self)
        self.steps_frame.grid(row=2, column=0, columnspan=2, padx=10, pady=10, sticky="nsew")
        self.steps_frame.grid_columnconfigure(0, weight=1)

        self.steps_label = customtkinter.CTkLabel(self.steps_frame, text="Steps:")
        self.steps_label.grid(row=0, column=0, columnspan=2, padx=10, pady=5, sticky="w")

        self.steps_list_frame = customtkinter.CTkScrollableFrame(self.steps_frame)
        self.steps_list_frame.grid(row=1, column=0, columnspan=2, padx=10, pady=5, sticky="nsew")
        self.steps_frame.grid_rowconfigure(1, weight=1)

        self.add_step_entry = customtkinter.CTkEntry(self.steps_frame, placeholder_text="Enter a new step")
        self.add_step_entry.grid(row=2, column=0, padx=10, pady=10, sticky="ew")

        self.add_step_button = customtkinter.CTkButton(self.steps_frame, text="Add Step", command=self.add_step)
        self.add_step_button.grid(row=2, column=1, padx=10, pady=10)

        self.populate_steps()

        # --- Save Button ---
        self.save_button = customtkinter.CTkButton(self, text="Save", command=self.save_and_close)
        self.save_button.grid(row=3, column=1, padx=10, pady=20, sticky="e")

    def populate_steps(self):
        # Clear existing step widgets
        for widget in self.steps_list_frame.winfo_children():
            widget.destroy()

        for i, step_text in enumerate(self.task.steps):
            step_frame = customtkinter.CTkFrame(self.steps_list_frame)
            step_frame.pack(fill="x", padx=5, pady=2)
            step_frame.grid_columnconfigure(0, weight=1)

            step_label = customtkinter.CTkLabel(step_frame, text=step_text)
            step_label.grid(row=0, column=0, padx=5, pady=2, sticky="w")

            remove_button = customtkinter.CTkButton(step_frame, text="Remove", width=60,
                                                    command=lambda index=i: self.remove_step(index))
            remove_button.grid(row=0, column=1, padx=5, pady=2)

    def add_step(self):
        step_text = self.add_step_entry.get()
        if step_text:
            self.task.steps.append(step_text)
            self.add_step_entry.delete(0, "end")
            self.populate_steps()

    def remove_step(self, index: int):
        self.task.steps.pop(index)
        self.populate_steps()

    def save_and_close(self):
        self.task.due_date = self.due_date_entry.get()
        self.task.urgency = int(self.urgency_slider.get())
        # Steps are already updated in the task object
        self.destroy()

class TaskFrame(customtkinter.CTkFrame):
    def __init__(self, master, task: Task, **kwargs):
        super().__init__(master, **kwargs)
        self.task = task

        self.grid_columnconfigure(0, weight=1)
        self.task_label = customtkinter.CTkLabel(self, text=self.get_display_text())
        self.task_label.grid(row=0, column=0, padx=10, pady=5, sticky="w")

        self.bind("<Double-Button-1>", self.open_edit_dialog)
        self.task_label.bind("<Double-Button-1>", self.open_edit_dialog)

    def open_edit_dialog(self, event=None):
        dialog = TaskEditDialog(self, self.task)
        self.wait_window(dialog) # Wait for the dialog to close
        self.update_task_display()

    def get_display_text(self):
        urgency_map = {0: "Low", 1: "Medium", 2: "High"}
        display_text = f"{self.task.title}"
        if self.task.steps:
            display_text += f" ({len(self.task.steps)} steps)"
        if self.task.due_date:
            display_text += f" (Due: {self.task.due_date})"
        display_text += f" - Urgency: {urgency_map[self.task.urgency]}"
        return display_text

    def update_task_display(self):
        self.task_label.configure(text=self.get_display_text())

class App(customtkinter.CTk):
    def __init__(self):
        super().__init__()

        self.title("Task Organizer")
        self.geometry("700x450")
        self.tasks: list[Task] = []
        self.task_frames: list[TaskFrame] = []

        # Set grid layout 1x2
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)

        # Create navigation frame
        self.navigation_frame = customtkinter.CTkFrame(self, corner_radius=0)
        self.navigation_frame.grid(row=0, column=0, sticky="nsew")
        self.navigation_frame.grid_rowconfigure(4, weight=1)

        self.navigation_frame_label = customtkinter.CTkLabel(self.navigation_frame, text="Task Organizer",
                                                             font=customtkinter.CTkFont(size=20, weight="bold"))
        self.navigation_frame_label.grid(row=0, column=0, padx=20, pady=20)

        self.add_task_entry = customtkinter.CTkEntry(self.navigation_frame, placeholder_text="Enter a new task")
        self.add_task_entry.grid(row=1, column=0, padx=20, pady=10, sticky="ew")

        self.add_task_button = customtkinter.CTkButton(self.navigation_frame, text="Add Task", command=self.add_task)
        self.add_task_button.grid(row=2, column=0, padx=20, pady=10)

        # Create tasks frame
        self.tasks_frame = customtkinter.CTkFrame(self, corner_radius=0, fg_color="transparent")
        self.tasks_frame.grid(row=0, column=1, sticky="nsew")
        self.tasks_frame.grid_rowconfigure(0, weight=1)
        self.tasks_frame.grid_columnconfigure(0, weight=1)

        self.task_list_frame = customtkinter.CTkScrollableFrame(self.tasks_frame, label_text="My Tasks")
        self.task_list_frame.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")

        # Load tasks and handle closing
        self.load_tasks()
        self.protocol("WM_DELETE_WINDOW", self.on_closing)

    def _create_task_frame(self, task: Task):
        task_frame = TaskFrame(self.task_list_frame, task=task)
        task_frame.pack(padx=10, pady=5, fill="x")
        self.task_frames.append(task_frame)
        task_frame.update_task_display()

    def add_task(self):
        task_text = self.add_task_entry.get()
        if task_text:
            new_task = Task(title=task_text)
            self.tasks.append(new_task)
            self._create_task_frame(new_task)
            self.add_task_entry.delete(0, "end")

    def load_tasks(self):
        if not os.path.exists(DATA_FILE):
            return

        try:
            with open(DATA_FILE, "r") as f:
                tasks_data = json.load(f)

            for task_data in tasks_data:
                task = Task(**task_data)
                self.tasks.append(task)
                self._create_task_frame(task)
        except (json.JSONDecodeError, TypeError) as e:
            print(f"Error loading tasks from {DATA_FILE}: {e}")
            # Optionally, show an error message to the user

    def save_tasks(self):
        with open(DATA_FILE, "w") as f:
            json.dump([asdict(task) for task in self.tasks], f, indent=4)

    def on_closing(self):
        self.save_tasks()
        self.destroy()


if __name__ == "__main__":
    app = App()
    app.mainloop()
