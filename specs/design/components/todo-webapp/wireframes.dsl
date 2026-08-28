// Todo app — single role, one core screen

screen TodoList "Signed-in user manages their own private todo list"
  navbar "TodoApp"
  row
    heading "My Todos"
    right
    avatar "Jane Doe"
  row
    input "What needs to be done?"
    button "Add todo" primary
  row
    badge "All (12)"
    badge "Active (8)" info
    badge "Completed (4)" success
  table "Todo | Status | "
    row "Buy groceries | Open | Mark complete →"
    row "Finish quarterly report | Open | Mark complete →"
    row "Call the dentist | Completed | "
    row "Read design doc | Open | Mark complete →"

flow "Manage my todos"
  role "User"
  description "A signed-in user adds todos and marks them complete"
  TodoList
