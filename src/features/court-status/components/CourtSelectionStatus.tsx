export function CourtSelectionStatus({
  connected,
  remaining,
}: {
  connected: boolean;
  remaining?: number;
}) {
  if (connected && remaining === undefined) return null;
  return (
    <div className="flex flex-wrap gap-x-3 px-3 py-1 text-xs text-slate-700">
      {!connected && <span role="status">Đang kết nối lại với bảng lịch.</span>}
      {remaining === 0 ? (
        <span role="status">Đang đồng bộ khung giờ đã chọn.</span>
      ) : (
        remaining !== undefined && <span role="timer">Thời gian giữ sân còn {remaining} giây.</span>
      )}
    </div>
  );
}
