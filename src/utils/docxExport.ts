import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageBreak,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';
import { Bloom3Level, Course, QuestionItem } from '../types';

export interface PermutedExamQuestion {
  originalIndex: number;
  question: QuestionItem;
  options: string[];
  correctIndex: number;
  bloom: Bloom3Level;
  cloCode: string;
  points: number;
}

export interface ExportDocxOptions {
  examTitle: string;
  course: Course;
  durationMinutes: number;
  exportContentType: 'student' | 'answer_key' | 'instructor';
  selectedExportCode: string; // 'all' or specific e.g. '101'
  availableExamCodes: string[];
  bloomLabels: Record<Bloom3Level, string>;
  getPermutedQuestionsForCode: (code: string) => PermutedExamQuestion[];
}

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
};

const thinBlackBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: '000000',
};

function createHeaderTable(
  course: Course,
  durationMinutes: number,
  code: string,
  isAnswerKey: boolean,
  isInstructor: boolean
): Table {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          // Cột trái: TÊN TRƯỜNG / KHOA, Học phần, Thời gian làm bài
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: {
              top: noBorder,
              bottom: noBorder,
              left: noBorder,
              right: noBorder,
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'BỘ GIÁO DỤC VÀ ĐÀO TẠO',
                    bold: true,
                    size: 20,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN',
                    bold: true,
                    size: 20,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'KHOA CÔNG NGHỆ THÔNG TIN',
                    size: 19,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 60, after: 40 },
                children: [
                  new TextRun({
                    text: 'Học phần: ',
                    bold: true,
                    size: 20,
                    font: 'Times New Roman',
                  }),
                  new TextRun({
                    text: `${course.code} - ${course.name}`,
                    bold: true,
                    size: 20,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: 'Thời gian làm bài: ',
                    bold: true,
                    size: 20,
                    font: 'Times New Roman',
                  }),
                  new TextRun({
                    text: `${durationMinutes} phút (Không kể thời gian phát đề)`,
                    size: 20,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),

          // Cột phải: Khung điền Họ và tên thí sinh, MSSV, Mã đề thi
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: {
              top: thinBlackBorder,
              bottom: thinBlackBorder,
              left: thinBlackBorder,
              right: thinBlackBorder,
            },
            shading: {
              type: ShadingType.CLEAR,
              fill: 'FAFAFA',
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 40 },
                children: [
                  new TextRun({
                    text: isAnswerKey
                      ? 'BẢNG ĐÁP ÁN CHẤM THI CHÍNH THỨC'
                      : 'ĐỀ THI KẾT THÚC HỌC PHẦN (OBE)',
                    bold: true,
                    size: 20,
                    font: 'Times New Roman',
                    color: isAnswerKey ? '047857' : '000000',
                  }),
                ],
              }),
              ...(isInstructor && !isAnswerKey
                ? [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 40 },
                      children: [
                        new TextRun({
                          text: '[BẢN GIẢNG VIÊN / LƯU TRỮ KHẢO THÍ]',
                          bold: true,
                          size: 18,
                          font: 'Times New Roman',
                          color: 'DC2626',
                        }),
                      ],
                    }),
                  ]
                : []),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: `MÃ ĐỀ THI: ${code}`,
                    bold: true,
                    size: 24,
                    font: 'Times New Roman',
                    color: '1E3A8A',
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: 'Họ và tên: .................................................',
                    size: 19,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: 'MSSV: ......................... Lớp: .....................',
                    size: 19,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 40, after: 60 },
                children: [
                  new TextRun({
                    text: 'Phòng thi: ................... Chữ ký GT: ...........',
                    size: 19,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createAnswerKeyTable(
  questions: PermutedExamQuestion[],
  targetCodes: string[],
  getPermutedQuestionsForCode: (code: string) => PermutedExamQuestion[],
  bloomLabels: Record<Bloom3Level, string>
): Table {
  const headerCells = [
    new TableCell({
      width: { size: 10, type: WidthType.PERCENTAGE },
      borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
      shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'STT', bold: true, size: 20, font: 'Times New Roman' })],
        }),
      ],
    }),
    ...targetCodes.map(
      (c) =>
        new TableCell({
          width: { size: Math.floor(55 / targetCodes.length), type: WidthType.PERCENTAGE },
          borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `Mã ${c}`, bold: true, size: 20, font: 'Times New Roman' })],
            }),
          ],
        })
    ),
    new TableCell({
      width: { size: 15, type: WidthType.PERCENTAGE },
      borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
      shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Chuẩn CLO', bold: true, size: 20, font: 'Times New Roman' })],
        }),
      ],
    }),
    new TableCell({
      width: { size: 12, type: WidthType.PERCENTAGE },
      borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
      shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Mức Bloom', bold: true, size: 20, font: 'Times New Roman' })],
        }),
      ],
    }),
    new TableCell({
      width: { size: 8, type: WidthType.PERCENTAGE },
      borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
      shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Điểm', bold: true, size: 20, font: 'Times New Roman' })],
        }),
      ],
    }),
  ];

  const bodyRows = questions.map((q, idx) => {
    return new TableRow({
      children: [
        new TableCell({
          borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `${idx + 1}`, bold: true, size: 20, font: 'Times New Roman' })],
            }),
          ],
        }),
        ...targetCodes.map((c) => {
          const permuted = getPermutedQuestionsForCode(c);
          const item = permuted[idx];
          const letter = String.fromCharCode(65 + (item ? item.correctIndex : q.correctIndex));
          return new TableCell({
            borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: letter,
                    bold: true,
                    size: 22,
                    color: '047857',
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          });
        }),
        new TableCell({
          borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: q.cloCode, size: 20, font: 'Times New Roman' })],
            }),
          ],
        }),
        new TableCell({
          borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: bloomLabels[q.bloom] || q.bloom, size: 19, font: 'Times New Roman' })],
            }),
          ],
        }),
        new TableCell({
          borders: { top: thinBlackBorder, bottom: thinBlackBorder, left: thinBlackBorder, right: thinBlackBorder },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `${q.points}`, size: 20, font: 'Times New Roman' })],
            }),
          ],
        }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: thinBlackBorder,
      bottom: thinBlackBorder,
      left: thinBlackBorder,
      right: thinBlackBorder,
      insideHorizontal: thinBlackBorder,
      insideVertical: thinBlackBorder,
    },
    rows: [new TableRow({ children: headerCells }), ...bodyRows],
  });
}

export async function exportExamToDocx(options: ExportDocxOptions): Promise<string> {
  const {
    examTitle,
    course,
    durationMinutes,
    exportContentType,
    selectedExportCode,
    availableExamCodes,
    bloomLabels,
    getPermutedQuestionsForCode,
  } = options;

  const targetCodes = selectedExportCode === 'all' ? availableExamCodes : [selectedExportCode];
  const safeCourseCode = course.code.replace(/[^\p{L}\p{N}_-]+/gu, '_');
  const safeCodeSuffix = selectedExportCode === 'all' ? 'Tat_Ca_Ma_De' : `Ma_${selectedExportCode}`;
  const fileName = `De_Thi_${safeCourseCode}_${safeCodeSuffix}.docx`;

  const children: (Paragraph | Table)[] = [];

  if (exportContentType === 'answer_key') {
    // -------------------------------------------------------------
    // OPTION: BẢNG ĐÁP ÁN CHẤM THI CHÍNH THỨC
    // -------------------------------------------------------------
    const headerTable = createHeaderTable(
      course,
      durationMinutes,
      targetCodes.join(', '),
      true,
      false
    );
    children.push(headerTable);

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 80 },
        children: [
          new TextRun({
            text: examTitle.toUpperCase(),
            bold: true,
            size: 26,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    const firstPermuted = getPermutedQuestionsForCode(targetCodes[0] || '101');
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `Bảng đáp án soi mã đề chuẩn OBE • Tổng số: ${firstPermuted.length} câu hỏi • Thang điểm 10.0`,
            italics: true,
            size: 20,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    const answerTable = createAnswerKeyTable(
      firstPermuted,
      targetCodes,
      getPermutedQuestionsForCode,
      bloomLabels
    );
    children.push(answerTable);

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 280 },
        children: [
          new TextRun({
            text: '--- HẾT BẢNG ĐÁP ÁN ---',
            bold: true,
            size: 20,
            font: 'Times New Roman',
          }),
        ],
      })
    );
  } else {
    // -------------------------------------------------------------
    // OPTION: ĐỀ THI CHO SINH VIÊN HOẶC KÈM ĐÁP ÁN & GIẢI THÍCH
    // -------------------------------------------------------------
    targetCodes.forEach((code, codeIdx) => {
      const permuted = getPermutedQuestionsForCode(code);

      if (codeIdx > 0) {
        children.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }

      // Header table 2 columns
      const headerTable = createHeaderTable(
        course,
        durationMinutes,
        code,
        false,
        exportContentType === 'instructor'
      );
      children.push(headerTable);

      // Exam Title
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 220, after: 60 },
          children: [
            new TextRun({
              text: examTitle.toUpperCase(),
              bold: true,
              size: 26,
              font: 'Times New Roman',
            }),
          ],
        })
      );

      // Subtitle line
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: `Môn học: ${course.code} - ${course.name} | Thời gian: ${durationMinutes} phút | Mã đề: `,
              size: 20,
              font: 'Times New Roman',
            }),
            new TextRun({
              text: `${code}`,
              bold: true,
              size: 20,
              font: 'Times New Roman',
              color: '1E3A8A',
            }),
          ],
        })
      );

      // Section banner
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 140 },
          border: {
            bottom: thinBlackBorder,
          },
          children: [
            new TextRun({
              text: `NỘI DUNG ĐỀ THI (${permuted.length} CÂU HỎI TRẮC NGHIỆM - THANG ĐIỂM 10.0)`,
              bold: true,
              size: 21,
              font: 'Times New Roman',
            }),
          ],
        })
      );

      // List of questions
      permuted.forEach((pq, qIdx) => {
        // Question title & content
        children.push(
          new Paragraph({
            spacing: { before: 180, after: 60 },
            children: [
              new TextRun({
                text: `Câu ${qIdx + 1}: `,
                bold: true,
                size: 22,
                font: 'Times New Roman',
              }),
              new TextRun({
                text: `${pq.question.content} `,
                size: 22,
                font: 'Times New Roman',
              }),
              new TextRun({
                text: `(${pq.points} điểm / Chuẩn CLO: ${pq.cloCode} - ${bloomLabels[pq.bloom] || pq.bloom})`,
                italics: true,
                size: 19,
                color: '4B5563',
                font: 'Times New Roman',
              }),
            ],
          })
        );

        // 4 Options A, B, C, D
        pq.options.forEach((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const isCorrect = pq.correctIndex === optIdx;
          const isInstructor = exportContentType === 'instructor';

          children.push(
            new Paragraph({
              indent: { left: 420 },
              spacing: { before: 30, after: 30 },
              children: [
                new TextRun({
                  text: `${letter}. `,
                  bold: true,
                  size: 21,
                  font: 'Times New Roman',
                  color: isInstructor && isCorrect ? '047857' : '000000',
                }),
                new TextRun({
                  text: `${opt}`,
                  size: 21,
                  font: 'Times New Roman',
                  bold: isInstructor && isCorrect,
                  underline: isInstructor && isCorrect ? {} : undefined,
                  color: isInstructor && isCorrect ? '047857' : '000000',
                }),
                ...(isInstructor && isCorrect
                  ? [
                      new TextRun({
                        text: '  ✔ (ĐÁP ÁN ĐÚNG)',
                        bold: true,
                        size: 20,
                        font: 'Times New Roman',
                        color: '047857',
                      }),
                    ]
                  : []),
              ],
            })
          );
        });

        // Detailed Explanation if instructor
        if (exportContentType === 'instructor' && pq.question.explanation) {
          children.push(
            new Paragraph({
              indent: { left: 420 },
              spacing: { before: 80, after: 120 },
              shading: {
                type: ShadingType.CLEAR,
                fill: 'FFFBEB',
              },
              children: [
                new TextRun({
                  text: '💡 Lưu ý / Giải thích chi tiết: ',
                  bold: true,
                  italics: true,
                  size: 20,
                  font: 'Times New Roman',
                  color: 'B45309',
                }),
                new TextRun({
                  text: pq.question.explanation,
                  italics: true,
                  size: 20,
                  font: 'Times New Roman',
                  color: '1F2937',
                }),
              ],
            })
          );
        }
      });

      // End of code
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 60 },
          children: [
            new TextRun({
              text: `--- HẾT (MÃ ĐỀ ${code}) ---`,
              bold: true,
              size: 21,
              font: 'Times New Roman',
            }),
          ],
        })
      );

      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: '(Cán bộ coi thi không giải thích gì thêm)',
              italics: true,
              size: 18,
              font: 'Times New Roman',
              color: '6B7280',
            }),
          ],
        })
      );
    });

    // Nếu chọn Kèm đáp án & giải thích, xuất thêm Bảng tổng kết đáp án ở cuối tài liệu
    if (exportContentType === 'instructor') {
      children.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );

      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 140 },
          children: [
            new TextRun({
              text: 'BẢNG TỔNG KẾT ĐÁP ÁN CHẤM THI CÁC MÃ ĐỀ',
              bold: true,
              size: 24,
              font: 'Times New Roman',
              color: '1E3A8A',
            }),
          ],
        })
      );

      const firstPermuted = getPermutedQuestionsForCode(targetCodes[0] || '101');
      const summaryTable = createAnswerKeyTable(
        firstPermuted,
        targetCodes,
        getPermutedQuestionsForCode,
        bloomLabels
      );
      children.push(summaryTable);
    }
  }

  // Khởi tạo Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 22,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~20mm
              bottom: 1134,
              left: 1418, // ~25mm
              right: 1134, // ~20mm
            },
          },
        },
        children,
      },
    ],
  });

  // Tải file trực tiếp qua Packer.toBlob và saveAs / fallback thẻ <a>
  const blob = await Packer.toBlob(doc);

  try {
    saveAs(blob, fileName);
  } catch {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return fileName;
}
