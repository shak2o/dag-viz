# dag-viz

TypeScript-библиотека для построения и визуализации направленных ациклических графов (DAG).

Подходит для отображения ML-пайплайнов, деревьев зависимостей сборки, редакторов воркфлоу и любых систем, где задачи выполняются в строго определённом порядке.

## Возможности

- Построение направленных графов с типизированным API узлов и рёбер
- Топологическая сортировка (алгоритм Кана, O(V + E), детерминированный порядок)
- Обнаружение циклов с точной ошибкой, которая указывает путь цикла
- Итеративный DFS — не переполняет стек вызовов на глубоких графах

## Технологии

TypeScript · Vitest · Prettier · Node.js 22

## Структура проекта

src/
graph/
Graph.ts — модель направленного графа
topologicalSort.ts — алгоритм Кана
cycle.ts — итеративный поиск цикла через DFS
errors.ts — CycleError с путём цикла
index.ts — публичный API
test/
graph/
Graph.test.ts
topologicalSort.test.ts


## Запуск

```bash
npm install
npm test
npm run build   # результат в dist/
```

## Использование

```ts
import { Graph, topologicalSort, CycleError } from "./src/index.js";

const graph = new Graph();

for (const id of ["ingest", "clean", "train", "evaluate"]) {
  graph.addNode(id);
}

graph.addEdge("ingest", "clean");
graph.addEdge("clean", "train");
graph.addEdge("train", "evaluate");

console.log(topologicalSort(graph));
// [ 'ingest', 'clean', 'train', 'evaluate' ]
```

### Обнаружение циклов

```ts
graph.addEdge("evaluate", "clean"); // создаёт цикл

try {
  topologicalSort(graph);
} catch (e) {
  if (e instanceof CycleError) {
    console.log(e.message);
    // Graph contains a cycle: clean -> train -> evaluate -> clean
    console.log(e.cycle);
    // [ 'clean', 'train', 'evaluate', 'clean' ]
  }
}
```

## Тесты

```bash
npm test
```

16 тестов: пустой граф, один узел, цепочка, ромб, изолированные узлы, цикл из трёх узлов, самопетля, цикл вне первого узла, дублирующие рёбра, неизвестные узлы, цепочка из 50 000 узлов.

## Ограничения

- Алгоритм раскладки (назначение слоёв и уменьшение пересечений) в разработке — появится в следующем этапе
- SVG-рендерер ещё не реализован
- Самопетли определяются как цикл и отклоняются при сортировке

## Планы развития

- [ ] Назначение слоёв по longest path
- [ ] Уменьшение пересечений рёбер барицентрическим методом
- [ ] SVG-рендерер с масштабированием и перетаскиванием
- [ ] React-демо с примером ML-пайплайна