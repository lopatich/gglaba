from oakvar import BaseReport
import sys

class Reporter(BaseReport):

    def setup (self):
        if self.args:
            self.levels_to_write = self.args.get("level")
        if not self.levels_to_write:
            self.levels_to_write = ['variant']

    def write_preface (self, level):
        self.level = level

    def write_header (self, level):
        line = '#'+'\t'.join([col['col_name'] for col in self.extracted_cols[level]])
        print(line)

    def write_table_row (self, row):
        print('\t'.join([str(v) if v != None else '' for v in list(row)]))

def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
