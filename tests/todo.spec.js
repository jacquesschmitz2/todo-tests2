import { test, expect } from '@playwright/test'
import { TodoPage } from './pages/TodoPage.js'

test.describe('Todo App', () => {
  let todoPage

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page)
    await todoPage.goto()
  })

  // ─────────────────────────────────────────────────
  // Grupo 1 — Estado inicial
  // ─────────────────────────────────────────────────

  test.describe('Estado inicial', () => {
    test('deve exibir o título da página', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'To-Do List' })).toBeVisible()
    })

    test('deve exibir a mensagem de lista vazia', async () => {
      await expect(todoPage.emptyMessage).toBeVisible()
      await expect(todoPage.emptyMessage).toContainText('Nenhum to-do')
    })

    test('deve exibir o input e o botão de adicionar', async () => {
      await expect(todoPage.todoInput).toBeVisible()
      await expect(todoPage.addButton).toBeVisible()
      await expect(todoPage.addButton).toHaveText('Adicionar')
    })
  })

  // ─────────────────────────────────────────────────
  // Grupo 2 — Adicionar todo
  // ─────────────────────────────────────────────────

  test.describe('Adicionar todo', () => {
    test('deve adicionar um todo e exibi-lo na lista', async () => {
      await todoPage.addTodo('Comprar pão')

      await expect(todoPage.todoItems).toHaveCount(1)
      await expect(todoPage.todoItems.first().getByTestId('todo-description')).toHaveText('Comprar pão')
    })

    test('deve limpar o input após adicionar', async () => {
      await todoPage.addTodo('Comprar pão')

      await expect(todoPage.todoInput).toHaveValue('')
    })

    test('deve exibir o novo todo no topo da lista', async () => {
      await todoPage.addTodo('Primeiro todo')
      await todoPage.addTodo('Segundo todo')

      const descriptions = await todoPage.getDescriptions()
      expect(descriptions[0]).toBe('Segundo todo')
      expect(descriptions[1]).toBe('Primeiro todo')
    })

    test('não deve adicionar todo com input vazio', async () => {
      await todoPage.addButton.click()

      await expect(todoPage.todoItems).toHaveCount(0)
      await expect(todoPage.emptyMessage).toBeVisible()
    })

    test('não deve adicionar todo com apenas espaços em branco', async () => {
      await todoPage.addTodo('     ')

      await expect(todoPage.todoItems).toHaveCount(0)
      await expect(todoPage.emptyMessage).toBeVisible()
    })
  })

  // ─────────────────────────────────────────────────
  // Grupo 3 — Marcar como concluído
  // ─────────────────────────────────────────────────

  test.describe('Marcar como concluído', () => {
    test.beforeEach(async () => {
      await todoPage.addTodo('Estudar Playwright')
    })

    test('deve marcar um todo como concluído', async ({ page }) => {
      await todoPage.toggleDone(0)

      const item = todoPage.todoItems.first()
      await expect(item).toHaveClass(/todo-item--done/)
      await expect(item.getByTestId('todo-description')).toHaveCSS('text-decoration-line', 'line-through')
    })

    test('deve desmarcar um todo concluído', async ({ page }) => {
      await todoPage.toggleDone(0)
      await todoPage.toggleDone(0)

      const item = todoPage.todoItems.first()
      await expect(item).not.toHaveClass(/todo-item--done/)
    })

    test('deve atualizar o contador ao marcar e desmarcar', async () => {
      await todoPage.addTodo('Segunda tarefa')

      await todoPage.toggleDone(0)
      await expect(todoPage.todoCount).toContainText('1/2')

      await todoPage.toggleDone(1)
      await expect(todoPage.todoCount).toContainText('2/2')

      await todoPage.toggleDone(0)
      await expect(todoPage.todoCount).toContainText('1/2')
    })
  })

  // ─────────────────────────────────────────────────
  // Grupo 4 — Editar
  // ─────────────────────────────────────────────────

  test.describe('Editar todo', () => {
    test.beforeEach(async () => {
      await todoPage.addTodo('Texto original')
    })

    test('deve entrar em modo de edição com o valor atual preenchido', async ({ page }) => {
      await todoPage.clickEdit(0)

      const editInput = page.getByTestId('edit-input')
      await expect(editInput).toBeVisible()
      await expect(editInput).toHaveValue('Texto original')
      await expect(page.getByTestId('save-edit-btn')).toBeVisible()
      await expect(page.getByTestId('cancel-edit-btn')).toBeVisible()
    })

    test('deve salvar a edição ao clicar em Salvar', async () => {
      await todoPage.clickEdit(0)
      await todoPage.fillEditInput('Texto editado')
      await todoPage.saveEdit()

      await expect(todoPage.todoItems.first().getByTestId('todo-description')).toHaveText('Texto editado')
      await expect(todoPage.todoItems.first().getByTestId('edit-input')).not.toBeVisible()
    })

    test('deve cancelar a edição ao clicar em Cancelar', async () => {
      await todoPage.clickEdit(0)
      await todoPage.fillEditInput('Texto que não deve salvar')
      await todoPage.cancelEdit()

      await expect(todoPage.todoItems.first().getByTestId('todo-description')).toHaveText('Texto original')
    })

    test('deve salvar a edição pressionando Enter', async () => {
      await todoPage.clickEdit(0)
      await todoPage.fillEditInput('Salvo com Enter')
      await todoPage.pressInEditInput('Enter')

      await expect(todoPage.todoItems.first().getByTestId('todo-description')).toHaveText('Salvo com Enter')
    })

    test('deve cancelar a edição pressionando Escape', async () => {
      await todoPage.clickEdit(0)
      await todoPage.fillEditInput('Cancelado com Escape')
      await todoPage.pressInEditInput('Escape')

      await expect(todoPage.todoItems.first().getByTestId('todo-description')).toHaveText('Texto original')
    })
  })

  // ─────────────────────────────────────────────────
  // Grupo 5 — Deletar
  // ─────────────────────────────────────────────────

  test.describe('Deletar todo', () => {
    test('deve deletar um todo da lista', async () => {
      await todoPage.addTodo('Para deletar')
      await todoPage.addTodo('Para manter')

      await todoPage.deleteTodo(1) // deleta "Para deletar" (índice 1, está abaixo do mais novo)

      await expect(todoPage.todoItems).toHaveCount(1)
      const descriptions = await todoPage.getDescriptions()
      expect(descriptions[0]).toBe('Para manter')
    })

    test('deve exibir mensagem de lista vazia após deletar o último item', async () => {
      await todoPage.addTodo('Único item')

      await expect(todoPage.emptyMessage).not.toBeVisible()

      await todoPage.deleteTodo(0)

      await expect(todoPage.todoItems).toHaveCount(0)
      await expect(todoPage.emptyMessage).toBeVisible()
    })
  })
})
