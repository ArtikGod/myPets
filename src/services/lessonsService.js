const db = require("../config/database");
const cacheService = require("./cacheService");
const APP_CONSTANTS = require("../constants");

class LessonsService {
    async getLessons(queryParams = {}) {
        const filters = this.parseAndValidateFilters(queryParams);

        const cacheKey = this.generateCacheKey(filters);
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const {
                startDate,
                endDate,
                status,
                teacherIds = [],
                minCount,
                maxCount,
                pageSize = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE,
                lastDate,
                lastId,
            } = filters;

            const lessons = await this.getLessonsBasic({
                startDate,
                endDate,
                status,
                teacherIds,
                minCount,
                maxCount,
                pageSize,
                lastDate,
                lastId,
            });

            if (lessons.length === 0) {
                const emptyResponse = {
                    data: [],
                    pagination: {
                        pageSize,
                        hasMore: false,
                        nextCursor: null,
                        count: 0,
                    },
                };
                cacheService.set(
                    cacheKey,
                    emptyResponse,
                    APP_CONSTANTS.CACHE.TTL_EMPTY_RESPONSE
                );
                return emptyResponse;
            }

            const lessonIds = lessons.map((lesson) => lesson.id);
            const [studentsData, teachersData, visitCounts] = await Promise.all(
                [
                    this.getStudentsForLessons(lessonIds).catch(() => ({})),
                    this.getTeachersForLessons(lessonIds).catch(() => ({})),
                    this.getVisitCountsForLessons(lessonIds).catch(() => ({})),
                ]
            );

            const result = this.mergeLessonData(
                lessons,
                studentsData,
                teachersData,
                visitCounts
            );

            const response = {
                data: result,
                pagination: this.buildPaginationResponse(result, pageSize),
            };

            cacheService.set(cacheKey, response);
            return response;
        } catch (error) {
            console.error("Error in getLessons:", error);
            throw error;
        }
    }

    parseAndValidateFilters(queryParams) {
        const filters = {};

        if (queryParams.date) {
            const dates = queryParams.date.split(",");
            if (dates.length === 1) {
                if (!APP_CONSTANTS.DATE_REGEX.test(dates[0])) {
                    throw new Error(APP_CONSTANTS.ERROR_MESSAGES.INVALID_DATE);
                }
                filters.startDate = dates[0];
                filters.endDate = dates[0];
            } else if (dates.length === 2) {
                if (
                    !APP_CONSTANTS.DATE_REGEX.test(dates[0]) ||
                    !APP_CONSTANTS.DATE_REGEX.test(dates[1])
                ) {
                    throw new Error(APP_CONSTANTS.ERROR_MESSAGES.INVALID_DATE);
                }
                filters.startDate = dates[0];
                filters.endDate = dates[1];
            } else {
                throw new Error(
                    APP_CONSTANTS.ERROR_MESSAGES.INVALID_DATE_PARAMETER_FORMAT
                );
            }
        }

        if (queryParams.status !== undefined) {
            const statusNum = parseInt(queryParams.status);
            if (isNaN(statusNum) || (statusNum !== 0 && statusNum !== 1)) {
                throw new Error(APP_CONSTANTS.ERROR_MESSAGES.INVALID_STATUS);
            }
            filters.status = statusNum;
        }

        if (queryParams.teacherIds) {
            const ids = queryParams.teacherIds
                .split(",")
                .map((id) => parseInt(id.trim()))
                .filter((id) => !isNaN(id) && id > 0);
            if (ids.length > APP_CONSTANTS.FILTERS.MAX_TEACHER_IDS) {
                throw new Error(
                    APP_CONSTANTS.ERROR_MESSAGES.TOO_MANY_TEACHERS(
                        APP_CONSTANTS.FILTERS.MAX_TEACHER_IDS
                    )
                );
            }
            if (ids.length > 0) {
                filters.teacherIds = ids;
            }
        }

        if (queryParams.studentsCount) {
            const counts = queryParams.studentsCount.split(",");
            if (counts.length === 1) {
                const count = parseInt(counts[0]);
                if (isNaN(count) || count < 0) {
                    throw new Error(
                        APP_CONSTANTS.ERROR_MESSAGES.INVALID_STUDENTS_COUNT
                    );
                }
                filters.minCount = count;
                filters.maxCount = count;
            } else if (counts.length === 2) {
                const minCount = parseInt(counts[0]);
                const maxCount = parseInt(counts[1]);
                if (
                    isNaN(minCount) ||
                    isNaN(maxCount) ||
                    minCount < 0 ||
                    maxCount < 0
                ) {
                    throw new Error(
                        APP_CONSTANTS.ERROR_MESSAGES.INVALID_STUDENTS_COUNT_RANGE
                    );
                }
                if (minCount > maxCount) {
                    throw new Error(
                        APP_CONSTANTS.ERROR_MESSAGES.MIN_GREATER_THAN_MAX
                    );
                }
                filters.minCount = minCount;
                filters.maxCount = maxCount;
            } else {
                throw new Error(
                    APP_CONSTANTS.ERROR_MESSAGES.INVALID_STUDENTS_COUNT_FORMAT
                );
            }
        }

        if (queryParams.pageSize) {
            const size = parseInt(queryParams.pageSize);
            if (isNaN(size) || size <= 0) {
                throw new Error(APP_CONSTANTS.ERROR_MESSAGES.INVALID_PAGE_SIZE);
            }
            if (size > APP_CONSTANTS.PAGINATION.MAX_PAGE_SIZE) {
                throw new Error(
                    APP_CONSTANTS.ERROR_MESSAGES.PAGE_SIZE_TOO_LARGE(
                        APP_CONSTANTS.PAGINATION.MAX_PAGE_SIZE
                    )
                );
            }
            filters.pageSize = size;
        }

        if (queryParams.lastDate && queryParams.lastId) {
            filters.lastDate = queryParams.lastDate;
            const lastId = parseInt(queryParams.lastId);
            if (isNaN(lastId)) {
                throw new Error(APP_CONSTANTS.ERROR_MESSAGES.INVALID_LAST_ID);
            }
            filters.lastId = lastId;
        }

        return filters;
    }

    async getLessonsBasic(filters) {
        const {
            startDate,
            endDate,
            status,
            teacherIds,
            minCount,
            maxCount,
            pageSize,
            lastDate,
            lastId,
        } = filters;

        let query = db("lessons as l").select(
            "l.id",
            "l.date",
            "l.title",
            "l.status"
        );

        if (startDate && endDate) {
            if (startDate === endDate) {
                query = query.where("l.date", startDate);
            } else {
                query = query.whereBetween("l.date", [startDate, endDate]);
            }
        }

        if (status !== undefined) {
            query = query.where("l.status", status);
        }

        if (teacherIds.length > 0) {
            query = query.whereExists(function () {
                this.select(1)
                    .from("lesson_teachers as lt")
                    .whereRaw("lt.lesson_id = l.id")
                    .whereIn("lt.teacher_id", teacherIds);
            });
        }

        if (minCount !== undefined || maxCount !== undefined) {
            query = query.whereExists(function () {
                this.select(1)
                    .from("lesson_students as ls")
                    .whereRaw("ls.lesson_id = l.id")
                    .groupBy("ls.lesson_id");

                if (minCount !== undefined && maxCount !== undefined) {
                    this.havingRaw("COUNT(*) BETWEEN ? AND ?", [
                        minCount,
                        maxCount,
                    ]);
                } else if (minCount !== undefined) {
                    this.havingRaw("COUNT(*) >= ?", [minCount]);
                } else {
                    this.havingRaw("COUNT(*) <= ?", [maxCount]);
                }
            });
        }

        query = query.orderByRaw("l.date ASC, l.id ASC");

        if (lastDate && lastId) {
            query = query.whereRaw("(l.date, l.id) > (?, ?)", [
                lastDate,
                lastId,
            ]);
        }

        query = query.limit(pageSize);

        return await query;
    }

    async getStudentsForLessons(lessonIds) {
        if (lessonIds.length === 0) return [];

        const students = await db("lesson_students as ls")
            .join("students as s", "ls.student_id", "s.id")
            .select("ls.lesson_id", "s.id", "s.name", "ls.visit")
            .whereIn("ls.lesson_id", lessonIds)
            .orderBy("ls.lesson_id");

        const grouped = {};
        students.forEach((student) => {
            if (!grouped[student.lesson_id]) {
                grouped[student.lesson_id] = [];
            }
            grouped[student.lesson_id].push({
                id: student.id,
                name: student.name,
                visit: student.visit,
            });
        });

        return grouped;
    }

    async getTeachersForLessons(lessonIds) {
        if (lessonIds.length === 0) return [];

        const teachers = await db("lesson_teachers as lt")
            .join("teachers as t", "lt.teacher_id", "t.id")
            .select("lt.lesson_id", "t.id", "t.name")
            .whereIn("lt.lesson_id", lessonIds)
            .orderBy("lt.lesson_id");

        const grouped = {};
        teachers.forEach((teacher) => {
            if (!grouped[teacher.lesson_id]) {
                grouped[teacher.lesson_id] = [];
            }
            grouped[teacher.lesson_id].push({
                id: teacher.id,
                name: teacher.name,
            });
        });

        return grouped;
    }

    async getVisitCountsForLessons(lessonIds) {
        if (lessonIds.length === 0) return {};

        const counts = await db("lesson_students")
            .select("lesson_id")
            .select(
                db.raw(
                    "SUM(CASE WHEN visit = true THEN 1 ELSE 0 END) as visit_count"
                )
            )
            .whereIn("lesson_id", lessonIds)
            .groupBy("lesson_id");

        const grouped = {};
        counts.forEach((count) => {
            grouped[count.lesson_id] = {
                visitCount: parseInt(count.visit_count) || 0,
            };
        });

        return grouped;
    }

    mergeLessonData(lessons, studentsData, teachersData, visitCounts) {
        return lessons.map((lesson) => ({
            id: lesson.id,
            date: lesson.date,
            title: lesson.title,
            status: lesson.status,
            visitCount: visitCounts[lesson.id]?.visitCount || 0,
            students: studentsData[lesson.id] || [],
            teachers: teachersData[lesson.id] || [],
        }));
    }

    buildPaginationResponse(lessons, requestedPageSize) {
        const pageSize =
            parseInt(requestedPageSize) ||
            APP_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE;
        const hasMore = lessons.length === pageSize;

        let nextCursor = null;
        if (hasMore && lessons.length > 0) {
            const lastLesson = lessons[lessons.length - 1];
            nextCursor = {
                lastDate: lastLesson.date,
                lastId: lastLesson.id,
            };
        }

        return {
            pageSize,
            hasMore,
            nextCursor,
            count: lessons.length,
        };
    }

    generateCacheKey(filters) {
        const keys = Object.keys(filters).sort();
        const parts = keys.map(
            (key) => `${key}:${JSON.stringify(filters[key])}`
        );
        return `${APP_CONSTANTS.CACHE.PREFIX}:${parts.join("|")}`;
    }

    clearCache() {
        cacheService.clear();
    }

    getCacheStats() {
        return cacheService.getStats();
    }
}

module.exports = new LessonsService();
