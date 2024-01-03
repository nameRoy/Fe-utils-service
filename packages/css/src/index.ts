import yauzl from "yauzl";
import path from "path";
import fs from "fs";
import less from "gulp-less";
import { src, dest } from "gulp";
import rename from "gulp-rename";
const resolve = (...args: string[]) => path.resolve(__dirname, ...args);
export function parseZip() {
  return new Promise((res, rej) => {
    const targetDir = resolve("../mock/temp");
    yauzl.open(
      resolve("../mock/index.zip"),
      { lazyEntries: true },
      (err, zipfile) => {
        if (err) rej(err);
        zipfile.readEntry();
        zipfile.on("entry", function (entry) {
          if (/\/$/.test(entry.fileName)) {
            fs.mkdirSync(path.join(targetDir, entry.fileName), {
              recursive: true,
            });
            zipfile.readEntry();
          } else {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) rej(err);
              const writeStream = fs.createWriteStream(
                path.join(targetDir, entry.fileName)
              );
              readStream.pipe(writeStream);
              writeStream.on("close", () => {
                zipfile.readEntry();
              });
            });
          }
        });
        zipfile.on("end", () => {
          res(true);
        });
      }
    );
  });
}

export function compileLess() {
  src(resolve("../mock/temp/custom.less"))
    .pipe(
      less({
        // @ts-ignore
        javascriptEnabled: true,
      })
    )
    .pipe(rename("index.css"))
    .pipe(dest(resolve("../mock/result")))
    .on("err", () => console.log("编译失败"))
    .on("end", () => console.log("编译成功"));
}

async function init() {
  // await parseZip();
  compileLess();
  console.log("done");
}
init();
