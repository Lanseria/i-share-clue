import { take } from 'lodash-es';
import { NButton, NSpace } from 'naive-ui';
import { TableColumn } from 'naive-ui/lib/data-table/src/interface';
import { h } from 'vue';

export interface OptList {
  name: string | ((row: IObj) => string);
  func: (row: IObj) => void;
  hidden?: (row: IObj) => boolean;
}
export const operateColums = (optList: OptList[], count = 10): TableColumn => {
  const hasMore = optList.length > count;
  const charList = optList.map((m) => (typeof m.name === 'string' ? m.name.length : 2));
  // TODO: 待处理难题
  // const width = hasMore ? take(charList, 2).reduce((x, y) => x + y * 30, 30) + 66 : charList.reduce((x, y) => x + y * 30, 30);
  return {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    render(row) {
      return h(NSpace, null, {
        default: () =>
          optList
            .filter((m) => {
              if (!m.hidden) {
                return true;
              } else {
                return m.hidden(row);
              }
            })
            .map((m, i) =>
              h(
                NButton,
                {
                  type: !i ? 'primary' : 'default',
                  size: 'small',
                  onClick: () => m.func(row),
                },
                { default: () => (typeof m.name === 'string' ? m.name : m.name(row)) }
              )
            ),
      });
    },
  };
};
