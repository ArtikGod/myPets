const http = require("http");

const BASE = "http://localhost:8080";

async function get(path) {
    return new Promise((ok, no) => {
        http.get(BASE + path, { timeout: 5000 }, (res) => {
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () => {
                try {
                    ok({
                        status: res.statusCode,
                        body: res.headers["content-type"]?.includes("json")
                            ? JSON.parse(body)
                            : body,
                    });
                } catch {
                    ok({ status: res.statusCode, body });
                }
            });
        })
            .on("error", no)
            .on("timeout", () => {
                no(new Error("timeout"));
            });
    });
}

const tests = [
    "/lessons",
    "/lessons?date=2019-09-01",
    "/lessons?date=2019-09-01,2019-09-04",
    "/lessons?status=1",
    "/lessons?teacherIds=1,3",
    "/lessons?studentsCount=2,4",
    "/lessons?pageSize=3",
    "/lessons?pageSize=3&lastDate=2019-09-01&lastId=1",
    "/lessons?pageSize=200",
    "/lessons?status=1&date=2019-09-01,2019-09-04&pageSize=5",
    "/lessons?date=invalid",
    "/lessons?status=999",
    "/lessons?teacherIds=" +
        Array(60)
            .fill()
            .map((_, i) => i + 1)
            .join(","),
];

(async () => {
    console.log("Запускаю быстрый тест...\n");

    for (let i = 0; i < tests.length; i++) {
        const path = tests[i];
        try {
            const start = Date.now();
            const r = await get(path);
            const time = Date.now() - start;

            console.log(`${i + 1}. ${path}`);
            console.log(`   → ${r.status} ${time}ms`);

            if (r.status === 200 && Array.isArray(r.body)) {
                console.log(`   найдено уроков: ${r.body.length}`);
                if (r.body.length > 0) {
                    const ex = r.body[0];
                    const date = ex.date.split("T")[0];
                    console.log(
                        `   пример → ${date} | ${ex.title} | учителей: ${ex.teachers.length} | учеников: ${ex.students.length} (посетило: ${ex.visitCount})`
                    );
                }
            } else if (r.status === 400) {
                console.log(
                    `   валидация: ${r.body.message || "Validation Error"}`
                );
            } else {
                console.log(`   что-то странное:`, r.body);
            }
        } catch (e) {
            console.log(`   ошибка: ${e.message}`);
        }
        console.log("");
    }

    console.log("Тест завершен");
})();
