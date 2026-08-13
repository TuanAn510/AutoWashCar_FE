import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { resolveImageUrl } from '@/lib/image-url';
import { type VehicleImage } from '@/types/vehicle';

const acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const maxFiles = 10;

interface VehicleImageUploaderProps {
  existingImages?: VehicleImage[];
  selectedFiles: File[];
  disabled?: boolean;
  onChange: (files: File[]) => void;
}

export function VehicleImageUploader({
  existingImages = [],
  selectedFiles,
  disabled = false,
  onChange,
}: VehicleImageUploaderProps) {
  const [inputKey, setInputKey] = useState(0);
  const previewUrls = useMemo(
    () =>
      selectedFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [previewUrls]);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(event.target.files ?? []);
    if (!incomingFiles.length) {
      return;
    }

    const invalidFile = incomingFiles.find((file) => !acceptedFileTypes.includes(file.type));
    if (invalidFile) {
      toast.error('Chỉ hỗ trợ ảnh JPG, JPEG hoặc PNG.');
      setInputKey((value) => value + 1);
      return;
    }

    const nextFiles = [...selectedFiles, ...incomingFiles];
    if (nextFiles.length > maxFiles) {
      toast.error('Bạn chỉ có thể tải lên tối đa 10 ảnh.');
      setInputKey((value) => value + 1);
      return;
    }

    onChange(nextFiles);
    setInputKey((value) => value + 1);
  };

  return (
    <Field className="space-y-4">
      <FieldLabel>Hình ảnh xe</FieldLabel>
      <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-slate-400 hover:bg-slate-100">
        <div className="flex size-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
          <ImagePlus className="size-5" />
        </div>
        <div>
          <p className="font-medium text-slate-900">Chọn tối đa 10 ảnh</p>
          <p className="mt-1 text-sm text-slate-500">Hỗ trợ JPG, JPEG, PNG với field `files`</p>
        </div>
        <input
          key={inputKey}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={handleSelectFiles}
        />
      </label>
      <FieldDescription>
        {selectedFiles.length > 0
          ? `Đã chọn ${selectedFiles.length} ảnh mới.`
          : 'Bạn có thể xem trước và bỏ từng ảnh trước khi lưu.'}
      </FieldDescription>

      {existingImages.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Ảnh hiện có</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {existingImages.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={resolveImageUrl(image.url)}
                  alt="Ảnh xe hiện tại"
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {previewUrls.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Ảnh sắp tải lên</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {previewUrls.map(({ file, previewUrl }) => (
              <div
                key={`${file.name}-${file.lastModified}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="aspect-square w-full object-cover"
                />
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <p className="truncate text-xs text-slate-500">{file.name}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    onClick={() =>
                      onChange(
                        selectedFiles.filter(
                          (selectedFile) =>
                            !(
                              selectedFile.name === file.name &&
                              selectedFile.lastModified === file.lastModified
                            )
                        )
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Xóa ảnh</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Field>
  );
}
