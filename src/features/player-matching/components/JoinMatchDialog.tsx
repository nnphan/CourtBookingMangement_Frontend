import { useState, useId } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useJoinMatch } from '../hooks/usePlayerMatching';
import type { MatchItem } from '../types/player-matching.types';
import { toast } from '@/lib/toast';
import { Calendar, Clock, MapPin, Award, ShieldCheck } from 'lucide-react';
import dayjs from '@/lib/dayjs';

interface JoinMatchDialogProps {
  match: MatchItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JoinMatchDialog = ({ match, isOpen, onClose }: JoinMatchDialogProps) => {
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const noteId = useId();
  const skillId = useId();

  const joinMutation = useJoinMatch();

  if (!match) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinMutation.mutateAsync({
        matchId: match.id,
        payload: {
          note,
          phone,
          skillLevel,
        },
      });

      toast.success(
        'Đã gửi yêu cầu ghép trận!',
        `Yêu cầu của bạn đã được gửi tới host ${match.host.name}. Vui lòng chờ phản hồi.`,
      );
      setNote('');
      setPhone('');
      onClose();
    } catch {
      toast.error('Không thể gửi yêu cầu', 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
    }
  };

  const formattedDate = dayjs(match.date).isValid()
    ? dayjs(match.date).format('DD/MM/YYYY')
    : match.date;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg overflow-hidden border border-line bg-surface p-0 shadow-2xl">
        {/* Header with match title */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-700 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                Ghép Trận Cầu Lông
              </span>
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
                Cần {match.remainingSlots} người
              </span>
            </div>
            <DialogTitle className="text-xl font-black text-white">
              Đăng ký tham gia trận đấu
            </DialogTitle>
            <DialogDescription className="text-emerald-100 text-xs mt-1">
              Kết nối và giao lưu cùng nhóm bạn chơi cầu lông tại {match.branchName}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          {/* Match summary card */}
          <div className="rounded-xl border border-line bg-surface-muted/60 p-4 space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-line">
              <img
                src={match.host.avatar}
                alt={match.host.name}
                className="size-11 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <p className="text-xs text-content-secondary font-medium">Người tạo trận (Host)</p>
                <p className="text-sm font-bold text-content-primary flex items-center gap-1.5">
                  {match.host.name}
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-content-secondary">
                <MapPin className="size-3.5 text-brand-600 shrink-0" />
                <span className="truncate font-semibold text-content-primary">
                  {match.branchName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-content-secondary">
                <Calendar className="size-3.5 text-brand-600 shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-content-secondary">
                <Clock className="size-3.5 text-brand-600 shrink-0" />
                <span>{match.startTime} - {match.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-content-secondary">
                <Award className="size-3.5 text-amber-600 shrink-0" />
                <span className="font-semibold text-amber-700">Trình độ: {match.skillLevel}</span>
              </div>
            </div>

            {match.feePerPlayer ? (
              <div className="flex items-center justify-between pt-2 border-t border-line text-xs">
                <span className="text-content-secondary">Chi phí dự kiến (tiền sân & cầu):</span>
                <span className="font-bold text-brand-700">
                  {match.feePerPlayer.toLocaleString('vi-VN')} đ / người
                </span>
              </div>
            ) : null}
          </div>

          {/* Form input fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-content-primary mb-1">
                Số điện thoại liên hệ <span className="text-danger">*</span>
              </label>
              <TextInput
                required
                type="tel"
                placeholder="Nhập số điện thoại của bạn (Zalo)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor={skillId} className="block text-xs font-bold text-content-primary mb-1">
                Trình độ tự đánh giá
              </label>
              <select
                id={skillId}
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-content-primary focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                <option value="Beginner">Beginner (Mới tập chơi)</option>
                <option value="Beginner+">Beginner+ (Đánh cơ bản, biết luật)</option>
                <option value="Intermediate">Intermediate (Trung bình, chạy bài đôi)</option>
                <option value="Advanced">Advanced (Khá / Nâng cao)</option>
                <option value="Professional">Professional (Bán chuyên / Chuyên)</option>
              </select>
            </div>

            <div>
              <label htmlFor={noteId} className="block text-xs font-bold text-content-primary mb-1">
                Lời nhắn cho Host (không bắt buộc)
              </label>
              <textarea
                id={noteId}
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Mình thường đánh vị trí lưới, xin tham gia cùng team nhé!"
                className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-content-primary focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-line"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={joinMutation.isPending}
              className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
            >
              {joinMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu tham gia'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
